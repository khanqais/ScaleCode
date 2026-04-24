import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Problem from '@/lib/models/Problem';
import { parseCppSignature, FunctionSignature } from '@/utils/cppDriver';


interface GeneratedTestCase {
  input: string;
  expectedOutput: string;
  rawInput: string;
  category?: string;
}

interface ConstraintBounds {
  minN: number | null;
  maxN: number | null;
  minVal: number | null;
  maxVal: number | null;
  allowNegatives: boolean;
  allowZero: boolean;
  allowDuplicates: boolean;
}


function parseConstraints(problemStatement: string): ConstraintBounds {
  const bounds: ConstraintBounds = {
    minN: null,
    maxN: null,
    minVal: null,
    maxVal: null,
    allowNegatives: false,
    allowZero: true,
    allowDuplicates: true,
  };

  const constraintsSection = problemStatement.match(
    /constraints?:?\s*([\s\S]+?)(?:\n\n|\n[A-Z]|$)/i
  )?.[1] ?? problemStatement;

  const evalExpr = (expr: string): number => {
    const clean = expr.trim().replace(/,/g, '');
    const withPow = clean.replace(/(\d+)\^(\d+)/g, (_, base, exp) =>
      String(Math.pow(parseInt(base), parseInt(exp)))
    );
    try {
      const result = Function(`"use strict"; return (${withPow})`)() as number;
      return isFinite(result) ? result : NaN;
    } catch {
      return NaN;
    }
  };

  // Array/string length bounds: 1 <= n <= 10^5  OR  n <= 200  OR  1 <= nums.length <= 1000
  const lengthPatterns = [
    /(\d[\d\s\^\*]*)\s*<=?\s*(?:n|nums?\.length|s\.length|arr(?:ay)?\.length|len(?:gth)?)\s*<=?\s*([\d\s\^\*\+]+)/gi,
    /(?:n|nums?\.length|s\.length|arr(?:ay)?\.length|len(?:gth)?)\s*<=?\s*([\d\s\^\*\+]+)/gi,
  ];

  for (const pattern of lengthPatterns) {
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(constraintsSection)) !== null) {
      if (m[2] !== undefined) {
        const lo = evalExpr(m[1]);
        const hi = evalExpr(m[2]);
        if (!isNaN(lo)) bounds.minN = lo;
        if (!isNaN(hi)) bounds.maxN = hi;
      } else if (m[1] !== undefined) {
        const hi = evalExpr(m[1]);
        if (!isNaN(hi)) bounds.maxN = hi;
      }
    }
  }

  // Element value bounds: -10^9 <= nums[i] <= 10^9  OR  0 <= val <= 100
  const valuePattern =
    /(-?[\d\s\^\*]+)\s*<=?\s*(?:nums?\[i\]|[a-z]+\[i\]|val(?:ues?)?|node(?:\.val)?|arr\[i\])\s*<=?\s*(-?[\d\s\^\*\+]+)/gi;
  let vm: RegExpExecArray | null;
  while ((vm = valuePattern.exec(constraintsSection)) !== null) {
    const lo = evalExpr(vm[1]);
    const hi = evalExpr(vm[2]);
    if (!isNaN(lo)) bounds.minVal = lo;
    if (!isNaN(hi)) bounds.maxVal = hi;
    if (lo < 0) bounds.allowNegatives = true;
    if (lo <= 0 && hi >= 0) bounds.allowZero = true;
  }

  // Infer negatives allowance from minVal
  if (bounds.minVal !== null && bounds.minVal < 0) bounds.allowNegatives = true;
  if (bounds.minVal !== null && bounds.minVal > 0) bounds.allowZero = false;

  // Whether duplicates are possible: constraints like "all unique", "distinct" → no duplicates
  if (/all (?:elements are )?unique|distinct|no duplicate/i.test(constraintsSection)) {
    bounds.allowDuplicates = false;
  }

  return bounds;
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are an expert competitive programming test case engineer.
Your job is to generate comprehensive, correct test cases for DSA problems.

ABSOLUTE RULES:
1. Every "expectedOutput" MUST be the mathematically/algorithmically correct answer — trace through the algorithm carefully.
2. "rawInput" must have EXACTLY the required number of lines, one per parameter.
3. Arrays use [1,2,3] format. Strings use "abc" (with quotes in rawInput). Integers are plain numbers.
4. Cover ALL specified test categories — do not skip any.
5. Return only valid JSON, no markdown, no explanation.`;
}

function buildConstraintSummary(bounds: ConstraintBounds): string {
  const parts: string[] = [];
  if (bounds.minN !== null) parts.push(`min length = ${bounds.minN}`);
  if (bounds.maxN !== null) parts.push(`max length = ${bounds.maxN} (cap array sizes at min(maxN, 15) for test cases)`);
  if (bounds.minVal !== null) parts.push(`min value = ${bounds.minVal}`);
  if (bounds.maxVal !== null) parts.push(`max value = ${bounds.maxVal}`);
  if (bounds.allowNegatives) parts.push('negative values ALLOWED');
  else parts.push('negative values NOT allowed');
  if (!bounds.allowZero) parts.push('zero NOT allowed');
  if (!bounds.allowDuplicates) parts.push('all values must be DISTINCT (no duplicates)');
  return parts.length > 0 ? parts.join(', ') : 'no explicit constraints found — infer from problem';
}

function buildCoverageChecklist(bounds: ConstraintBounds, sig: FunctionSignature | null): string {
  const hasArray = sig?.params.some(p => p.type.includes('vector')) ?? false;
  const hasString = sig?.params.some(p => p.type === 'string') ?? false;
  const hasTree = sig?.params.some(p => p.type.includes('TreeNode')) ?? false;
  const hasLinkedList = sig?.params.some(p => p.type.includes('ListNode')) ?? false;

  const categories: string[] = [
    '1. TRIVIAL — smallest possible valid input (e.g., single element, empty if allowed)',
    '2. MIN_BOUND — input at exact minimum constraint boundary',
    '3. MAX_BOUND — input at max constraint boundary (cap at 15 elements)',
    '4. ALL_SAME — all elements are identical',
    '5. SORTED_ASC — input already sorted ascending',
    '6. SORTED_DESC — input sorted descending (reverse order)',
    '7. ALTERNATING — alternating pattern (e.g., high-low-high or positive-negative)',
  ];

  if (bounds.allowNegatives) {
    categories.push('8. ALL_NEGATIVE — all elements are negative');
    categories.push('9. MIX_NEG_POS — mix of negative, zero (if allowed), and positive');
  }
  if (bounds.allowZero) {
    categories.push('10. CONTAINS_ZERO — includes zero value(s)');
  }
  if (bounds.allowDuplicates) {
    categories.push('11. MANY_DUPLICATES — heavily duplicated values (e.g., [3,3,3,1,3,3])');
  }
  if (hasArray) {
    categories.push('12. TWO_ELEMENTS — exactly two elements');
    categories.push('13. OFF_BY_ONE — input designed to catch index boundary bugs');
  }
  if (hasString) {
    categories.push('14. SINGLE_CHAR — single character string');
    categories.push('15. ALL_SAME_CHAR — all characters identical');
    categories.push('16. PALINDROME — palindromic string input where relevant');
  }
  if (hasTree) {
    categories.push('14. NULL_TREE — root is null/empty tree []');
    categories.push('15. SINGLE_NODE — tree with one node');
    categories.push('16. LEFT_SKEWED — all nodes go left (linear chain)');
    categories.push('17. RIGHT_SKEWED — all nodes go right');
    categories.push('18. PERFECT_TREE — complete balanced binary tree');
  }
  if (hasLinkedList) {
    categories.push('14. EMPTY_LIST — null/empty linked list []');
    categories.push('15. SINGLE_NODE — list with one node');
    categories.push('16. TWO_NODES — list with exactly two nodes');
  }
  categories.push('LAST. RANDOM_STRESS — a realistic medium-to-large random input');

  return categories.join('\n');
}

function buildUserPrompt(
  title: string,
  problemStatement: string,
  sig: FunctionSignature | null,
  paramCount: number,
  formatExample: string,
  constraintSummary: string,
  coverageChecklist: string
): string {
  const sigLine = sig
    ? `${sig.returnType} ${sig.functionName}(${sig.params.map(p => `${p.type} ${p.name}`).join(', ')})`
    : 'Unknown signature';

  const rawInputFormat = sig
    ? sig.params.map((p, i) => `  Line ${i + 1}: ${p.name} (${p.type})`).join('\n')
    : `  ${paramCount} line(s), one per parameter`;

  return `Generate test cases for the following DSA problem.

━━━ PROBLEM ━━━
Title: ${title}

${problemStatement}

━━━ FUNCTION SIGNATURE ━━━
${sigLine}

rawInput format (EXACTLY ${paramCount} line(s) per test case):
${rawInputFormat}

━━━ PARSED CONSTRAINTS ━━━
${constraintSummary}

━━━ FORMAT REFERENCE (match this exactly) ━━━
${formatExample}

━━━ REQUIRED COVERAGE CATEGORIES ━━━
Generate one test case for EACH category below. Label each with its category name in a "category" field.
${coverageChecklist}

━━━ OUTPUT RULES ━━━
- "input": human-readable string, e.g. "nums = [1,2,3], target = 6"
- "expectedOutput": the CORRECT answer — trace through the algorithm step by step before writing it
- "rawInput": lines joined by literal \\n character. Arrays=[1,2,3], strings="hello", ints=42, bools=true/false
- Do NOT violate the constraints (e.g., if values must be ≥ 0, do not use negatives)
- Do NOT generate duplicate test cases

Return JSON:
{"testCases":[{"input":"...","expectedOutput":"...","rawInput":"...","category":"..."}]}`;
}

// ─── Groq API Call ────────────────────────────────────────────────────────────

async function callGroq(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs = 45000
): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.15,
      max_tokens: 8192,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Groq API error: ${res.status}`);
  }

  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? '{}';
}

// ─── JSON Parser ──────────────────────────────────────────────────────────────

function parseGroqJson(raw: string): { testCases?: GeneratedTestCase[] } {
  try {
    return JSON.parse(raw) as { testCases?: GeneratedTestCase[] };
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]) as { testCases?: GeneratedTestCase[] };
    throw new Error('Failed to parse AI response as JSON');
  }
}

// ─── Test Case Validator ──────────────────────────────────────────────────────

function validateTestCases(
  rawCases: GeneratedTestCase[],
  paramCount: number,
  bounds: ConstraintBounds
): GeneratedTestCase[] {
  const seen = new Set<string>();

  return rawCases.filter(tc => {
    // Must have all required fields
    if (!tc.input?.trim() || !tc.expectedOutput?.trim() || !tc.rawInput?.trim()) return false;

    // rawInput must have exactly paramCount non-empty lines
    const lines = tc.rawInput.split('\n').filter(l => l.trim() !== '');
    if (lines.length !== paramCount) return false;

    // De-duplicate by rawInput content
    const key = tc.rawInput.trim();
    if (seen.has(key)) return false;
    seen.add(key);

    // Basic sanity: expectedOutput should not be obviously empty or a placeholder
    const out = tc.expectedOutput.trim();
    if (out === '...' || out === 'null' || out === 'undefined' || out === '') return false;

    // Constraint-aware validation: if negatives not allowed, ensure array inputs don't have them
    if (!bounds.allowNegatives) {
      // Check array-like lines for negative numbers
      const arrayLines = lines.filter(l => l.trim().startsWith('['));
      const hasNegative = arrayLines.some(l => /\[-?\d*-\d/.test(l) || /,\s*-\d/.test(l) || l.startsWith('[-'));
      if (hasNegative) return false;
    }

    return true;
  });
}

// ─── Route Handler ────────────────────────────────────────────────────────────

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
        { success: false, error: 'AI service not configured. Add GROQ_API to environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json() as { problemId?: string };
    const { problemId } = body;

    if (!problemId) {
      return NextResponse.json(
        { success: false, error: 'problemId is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const problem = await Problem.findOne({ _id: problemId, userId: session.user.id })
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

    // ── Parse signature & constraints ──────────────────────────────────────────
    const existingTestCases = problem.testCases ?? [];

    let sig: FunctionSignature | null = null;
    let paramCount = 1;

    if (problem.cppCodeTemplate) {
      sig = parseCppSignature(problem.cppCodeTemplate);
      if (sig) paramCount = sig.params.length;
    }

    const bounds = parseConstraints(problem.problemStatement);

    // ── Build prompts ──────────────────────────────────────────────────────────
    const systemPrompt = buildSystemPrompt();
    const constraintSummary = buildConstraintSummary(bounds);
    const coverageChecklist = buildCoverageChecklist(bounds, sig);

    // Use up to 3 existing examples as format reference
    const sampleCases = existingTestCases.slice(0, 3);
    const formatExample = sampleCases.length > 0
      ? sampleCases.map(tc =>
        `{"input":"${tc.input}","expectedOutput":"${tc.expectedOutput}","rawInput":"${tc.rawInput.replace(/\n/g, '\\n')}"}`
      ).join('\n')
      : '(no existing examples — infer format from the function signature above)';

    const userPrompt = buildUserPrompt(
      problem.title,
      problem.problemStatement,
      sig,
      paramCount,
      formatExample,
      constraintSummary,
      coverageChecklist
    );

    // ── First call to Groq ─────────────────────────────────────────────────────
    const raw1 = await callGroq(apiKey, systemPrompt, userPrompt, 45000);
    const parsed1 = parseGroqJson(raw1);
    const rawCases1 = (parsed1.testCases ?? []) as GeneratedTestCase[];
    const valid1 = validateTestCases(rawCases1, paramCount, bounds);

    // ── Dedup against existing test cases ─────────────────────────────────────
    const existingRawInputs = new Set(existingTestCases.map(tc => tc.rawInput.trim()));
    const newCases = valid1.filter(tc => !existingRawInputs.has(tc.rawInput.trim()));

    // ── If fewer than 8 valid new cases, do a targeted retry pass ─────────────
    let finalCases = newCases;

    if (newCases.length < 8) {
      const missedCategories = extractMissedCategories(valid1, coverageChecklist);
      if (missedCategories.length > 0) {
        const retryPrompt = buildRetryPrompt(
          problem.title,
          problem.problemStatement,
          sig,
          paramCount,
          formatExample,
          constraintSummary,
          missedCategories
        );

        try {
          const raw2 = await callGroq(apiKey, systemPrompt, retryPrompt, 30000);
          const parsed2 = parseGroqJson(raw2);
          const rawCases2 = (parsed2.testCases ?? []) as GeneratedTestCase[];
          const valid2 = validateTestCases(rawCases2, paramCount, bounds);

          // Merge, dedup by rawInput
          const combined = [...newCases];
          const seenRaw = new Set(newCases.map(tc => tc.rawInput.trim()));
          for (const tc of valid2) {
            const key = tc.rawInput.trim();
            if (!seenRaw.has(key) && !existingRawInputs.has(key)) {
              combined.push(tc);
              seenRaw.add(key);
            }
          }
          finalCases = combined;
        } catch {
          // Retry failed — use what we have from the first pass
        }
      }
    }

    if (finalCases.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI could not generate valid new test cases. The problem may be too complex or the constraint format is unusual.',
        },
        { status: 500 }
      );
    }

    // ── Persist to DB ──────────────────────────────────────────────────────────
    await Problem.findByIdAndUpdate(problemId, {
      $push: {
        testCases: {
          $each: finalCases.map(tc => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            rawInput: tc.rawInput,
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Generated ${finalCases.length} comprehensive test cases`,
      count: finalCases.length,
      breakdown: summarizeCategories(finalCases),
      constraintsParsed: bounds,
      testCases: finalCases,
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


function extractMissedCategories(
  generated: GeneratedTestCase[],
  checklist: string
): string[] {
  const coveredCategories = new Set(
    generated.map(tc => (tc.category ?? '').toUpperCase().trim())
  );

  const allCategories = checklist
    .split('\n')
    .map(line => {
      const m = line.match(/^\d+\.\s+([A-Z_]+)/);
      return m ? m[1] : null;
    })
    .filter((c): c is string => c !== null);

  return allCategories.filter(cat => !coveredCategories.has(cat));
}

/** Builds a focused retry prompt for missed categories */
function buildRetryPrompt(
  title: string,
  problemStatement: string,
  sig: FunctionSignature | null,
  paramCount: number,
  formatExample: string,
  constraintSummary: string,
  missedCategories: string[]
): string {
  const sigLine = sig
    ? `${sig.returnType} ${sig.functionName}(${sig.params.map(p => `${p.type} ${p.name}`).join(', ')})`
    : 'Unknown signature';

  const rawInputFormat = sig
    ? sig.params.map((p, i) => `  Line ${i + 1}: ${p.name} (${p.type})`).join('\n')
    : `  ${paramCount} line(s)`;

  return `Generate ONLY the following missing test case categories for the problem: ${title}

${problemStatement.slice(0, 800)}

Signature: ${sigLine}
rawInput format (${paramCount} lines):
${rawInputFormat}

Constraints: ${constraintSummary}

Format reference:
${formatExample}

MISSING CATEGORIES TO COVER:
${missedCategories.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Generate exactly one test case per missing category. Include "category" field.
Return JSON: {"testCases":[{"input":"...","expectedOutput":"...","rawInput":"...","category":"..."}]}`;
}

/** Summarizes generated test cases by category for the API response */
function summarizeCategories(cases: GeneratedTestCase[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const tc of cases) {
    const cat = tc.category ?? 'UNCATEGORIZED';
    summary[cat] = (summary[cat] ?? 0) + 1;
  }
  return summary;
}
