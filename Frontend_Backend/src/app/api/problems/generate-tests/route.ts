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
  existingExamples: string,
  paramCount: number,
  existingCount: number
): string {
  const targetCount = Math.max(7 - existingCount, 4);

  return `Generate exactly ${targetCount} additional edge-case test cases for this competitive programming problem.

PROBLEM: ${title}

STATEMENT:
${problemStatement}

${signatureInfo ? `FUNCTION SIGNATURE:\n${signatureInfo}\n` : ''}
EXISTING TEST CASES (use as format reference — do NOT repeat these):
${existingExamples}

REQUIREMENTS:
1. Generate exactly ${targetCount} NEW test cases that are DIFFERENT from all existing ones.
2. Each test case MUST have exactly three fields:
   - "input": Human-readable display string matching the style of existing examples (e.g. "nums = [2,7,11,15], target = 9")
   - "expectedOutput": The CORRECT output as a string (e.g. "[0,1]"). You MUST solve the problem yourself to compute this correctly.
   - "rawInput": LeetCode-style raw input with EXACTLY ${paramCount} line(s) separated by \\n, one per function parameter in order. Arrays use [1,2,3], strings use "abc", integers are plain numbers, booleans are true/false.
3. Edge cases to cover:
   - Minimum valid input size (e.g. smallest allowed array length)
   - Single element or two-element inputs where applicable
   - All identical elements
   - Negative numbers and zeros where applicable
   - Already sorted / reverse sorted inputs where applicable
   - Boundary constraint values
   - Cases that commonly cause off-by-one or overflow errors
4. Keep all arrays/inputs small (≤ 15 elements) so outputs are verifiable.
5. The expectedOutput MUST be mathematically correct. Double-check by mentally running the algorithm.

CRITICAL: rawInput must have EXACTLY ${paramCount} line(s) per test case, separated by \\n. This directly maps to the function parameters in order.

Return ONLY valid JSON with this exact structure, no markdown fences, no explanation:
{
  "testCases": [
    { "input": "...", "expectedOutput": "...", "rawInput": "..." }
  ]
}`;
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

    const problem = await Problem.findOne({
      _id: problemId,
      userId: session.user.id,
    });

    if (!problem) {
      return NextResponse.json(
        { success: false, error: 'Problem not found' },
        { status: 404 }
      );
    }

    const cppTemplate = problem.cppCodeTemplate as string;
    const existingTestCases = (problem.testCases || []) as Array<{
      input: string;
      expectedOutput: string;
      rawInput: string;
    }>;

    let signatureInfo = '';
    let paramCount = 1;

    if (cppTemplate) {
      const sig = parseCppSignature(cppTemplate);
      if (sig) {
        paramCount = sig.params.length;
        signatureInfo = `${sig.returnType} ${sig.functionName}(${sig.params.map(p => `${p.type} ${p.name}`).join(', ')})

Parameters (${paramCount} total — rawInput must have exactly ${paramCount} line(s), one per parameter):
${sig.params.map((p, i) => `  Line ${i + 1}: ${p.name} (type: ${p.type})`).join('\n')}
Return type: ${sig.returnType}`;
      }
    }

    const existingExamplesStr = existingTestCases.length > 0
      ? existingTestCases.map((tc, i) =>
          `Test Case ${i + 1}:\n  input: "${tc.input}"\n  expectedOutput: "${tc.expectedOutput}"\n  rawInput: "${tc.rawInput.replace(/\n/g, '\\n')}"`
        ).join('\n\n')
      : 'No existing test cases.';

    const prompt = buildTestCasePrompt(
      problem.title as string,
      problem.problemStatement as string,
      signatureInfo,
      existingExamplesStr,
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
            content: 'You are a precise test case generator for competitive programming problems. You always return valid JSON only. You solve each problem carefully to ensure expectedOutput values are correct.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2048,
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
