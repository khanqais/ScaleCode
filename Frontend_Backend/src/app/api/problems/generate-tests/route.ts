import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Problem from '@/lib/models/Problem';
import { parseCppSignature } from '@/utils/cppDriver';

interface GeneratedTestCase {
  input: string;
  expectedOutput: string;
  rawInput: string;
}

function buildTestCasePrompt(
  title: string,
  problemStatement: string,
  signatureInfo: string,
  formatExample: string,
  paramCount: number,
  existingCount: number
): string {
  const targetCount = Math.min(Math.max(10 - existingCount, 7), 10);

  return `Generate ${targetCount} edge-case test cases for: ${title}

${problemStatement}
${signatureInfo ? `\nSignature: ${signatureInfo}` : ''}

Format reference (match this exactly):
${formatExample}

Rules:
- "input": human-readable (e.g. "nums = [1,2], target = 3")
- "expectedOutput": correct answer as string — solve it yourself
- "rawInput": EXACTLY ${paramCount} line(s) joined by \\n, one per param. Arrays=[1,2,3], strings="abc", ints=plain numbers
- Cover: min size, max size (≤15 elements), zeros, negatives, duplicates, sorted/reverse, off-by-one edges
- All expectedOutput values MUST be correct

{"testCases":[{"input":"...","expectedOutput":"...","rawInput":"..."}]}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const apiKey = process.env.GROQ_API;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please add GROQ_API to your environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { problemId } = body as { problemId?: string };

    if (!problemId) {
      return NextResponse.json(
        { success: false, error: 'problemId is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const problem = await Problem.findOne(
      { _id: problemId, userId: session.user.id },
    )
      .select('title problemStatement testCases cppCodeTemplate')
      .lean<{
        title: string;
        problemStatement: string;
        testCases: { input: string; expectedOutput: string; rawInput: string }[];
        cppCodeTemplate: string;
      }>();

    if (!problem) {
      return NextResponse.json(
        { success: false, error: 'Problem not found' },
        { status: 404 }
      );
    }

    const existingTestCases = problem.testCases || [];

    let signatureInfo = '';
    let paramCount = 1;

    if (problem.cppCodeTemplate) {
      const sig = parseCppSignature(problem.cppCodeTemplate);
      if (sig) {
        paramCount = sig.params.length;
        signatureInfo = `${sig.returnType} ${sig.functionName}(${sig.params.map(p => `${p.type} ${p.name}`).join(', ')})
Params (${paramCount}): ${sig.params.map((p, i) => `line${i + 1}=${p.name}:${p.type}`).join(', ')}`;
      }
    }

    const firstExample = existingTestCases[0];
    const formatExample = firstExample
      ? `{"input":"${firstExample.input}","expectedOutput":"${firstExample.expectedOutput}","rawInput":"${firstExample.rawInput.replace(/\n/g, '\\n')}"}`
      : 'No existing test cases.';

    const prompt = buildTestCasePrompt(
      problem.title,
      problem.problemStatement,
      signatureInfo,
      formatExample,
      paramCount,
      existingTestCases.length
    );

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Precise test case generator. Return valid JSON only. Solve each problem to ensure correct expectedOutput.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json().catch(() => ({}));
      const errorMsg = (errorData as { error?: { message?: string } }).error?.message || `Groq API error: ${groqResponse.status}`;
      throw new Error(errorMsg);
    }

    const data = await groqResponse.json();
    const raw = data.choices?.[0]?.message?.content ?? '{}';

    let generated: { testCases?: GeneratedTestCase[] };
    try {
      generated = JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generated = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    const rawTestCases = (generated.testCases ?? []) as GeneratedTestCase[];

    const validTestCases = rawTestCases.filter(tc => {
      if (!tc.input || !tc.expectedOutput || !tc.rawInput) return false;
      const lines = tc.rawInput.split('\n').filter(l => l.trim() !== '');
      return lines.length === paramCount;
    });

    if (validTestCases.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'AI could not generate valid test cases for this problem',
      }, { status: 500 });
    }

    await Problem.findByIdAndUpdate(problemId, {
      $push: {
        testCases: {
          $each: validTestCases.map(tc => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            rawInput: tc.rawInput,
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Generated ${validTestCases.length} additional test cases`,
      count: validTestCases.length,
      testCases: validTestCases,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('timed out') || message.includes('AbortError')) {
      return NextResponse.json(
        { success: false, error: 'Test case generation timed out. Please try again.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Failed to generate test cases: ${message}` },
      { status: 500 }
    );
  }
}
