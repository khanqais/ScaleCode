import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Problem from '@/lib/models/Problem';
import {
  parseCppSignature,
  generateCppProgram,
  buildStdin,
  parseOutput,
  normalizeForComparison,
} from '@/utils/cppDriver';


const GODBOLT_URL = 'https://godbolt.org/api/compiler/g132/compile';

interface GodboltLine {
  text: string;
}

interface GodboltExecResult {
  code: number;
  signal?: string;
  stdout: GodboltLine[];
  stderr: GodboltLine[];
  buildResult?: {
    code: number;
    stdout: GodboltLine[];
    stderr: GodboltLine[];
  };
}

interface GodboltResponse {
  code: number;
  signal?: string;
  stdout: GodboltLine[];
  stderr: GodboltLine[];
  didExecute?: boolean;
  buildResult?: {
    code: number;
    stdout: GodboltLine[];
    stderr: GodboltLine[];
  };
  asm?: unknown[];
}

function joinLines(lines: GodboltLine[] | undefined): string {
  if (!lines || lines.length === 0) return '';
  return lines.map(l => l.text).join('\n');
}

interface TestCaseResult {
  testCase: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
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

    const body = await request.json();
    const { problemId, userCode } = body as {
      problemId?: string;
      userCode?: string;
    };

    if (!problemId || !userCode?.trim()) {
      return NextResponse.json(
        { success: false, error: 'problemId and userCode are required' },
        { status: 400 }
      );
    }

    // Fetch problem from DB
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

    const testCases = problem.testCases as Array<{
      input: string;
      expectedOutput: string;
      rawInput: string;
    }>;

    if (!testCases || testCases.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No test cases available for this problem' },
        { status: 400 }
      );
    }

    const validTestCases = testCases.filter(tc => tc.rawInput && tc.expectedOutput);
    if (validTestCases.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid test cases with raw input data' },
        { status: 400 }
      );
    }

    const cppTemplate = problem.cppCodeTemplate as string;
    if (!cppTemplate) {
      return NextResponse.json(
        { success: false, error: 'No C++ code template available. Code execution requires a LeetCode problem with a C++ template.' },
        { status: 400 }
      );
    }

    const signature = parseCppSignature(cppTemplate);
    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Could not parse function signature from the C++ template' },
        { status: 400 }
      );
    }

    let fullProgram: string;
    try {
      fullProgram = generateCppProgram(userCode, signature);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: `Driver generation failed: ${err instanceof Error ? err.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    const stdin = buildStdin(validTestCases);

    let godboltResult: GodboltResponse;
    try {
      const res = await fetch(GODBOLT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          source: fullProgram,
          compiler: 'g132',
          options: {
            userArguments: '-O2 -std=gnu++17',
            executeParameters: {
              args: [],
              stdin: stdin,
            },
            compilerOptions: {
              executorRequest: true,  // run the program, not just compile
            },
            filters: {
              execute: true,
            },
            tools: [],
            libraries: [],
          },
          lang: 'c++',
          allowStoreCodeDebug: false,
        }),
        signal: AbortSignal.timeout(35000),
      });

      if (!res.ok) {
        const text = await res.text();
        return NextResponse.json(
          { success: false, error: `Code execution service error (${res.status}): ${text}` },
          { status: 502 }
        );
      }

      godboltResult = await res.json() as GodboltResponse;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('timed out') || msg.includes('AbortError')) {
        return NextResponse.json(
          { success: false, error: 'Code execution timed out. Please try again.' },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Failed to reach code execution service: ${msg}` },
        { status: 502 }
      );
    }


    const buildCode = godboltResult.buildResult?.code ?? 0;
    if (buildCode !== 0 && !godboltResult.didExecute) {
      const compileStderr = joinLines(godboltResult.buildResult?.stderr);
      return NextResponse.json({
        success: false,
        error: 'Compilation Error',
        compileError: compileStderr || 'Unknown compilation error',
      }, { status: 200 });
    }


    if (godboltResult.signal) {
      const sig = godboltResult.signal.toUpperCase();
      if (sig === 'SIGKILL' || sig.includes('KILL')) {
        return NextResponse.json({
          success: false,
          error: 'Time Limit Exceeded',
          runtimeError: 'Your solution exceeded the time limit.',
        }, { status: 200 });
      }
      return NextResponse.json({
        success: false,
        error: 'Runtime Error',
        runtimeError: joinLines(godboltResult.stderr) || `Killed by signal: ${godboltResult.signal}`,
      }, { status: 200 });
    }


    if (godboltResult.code !== 0) {
      return NextResponse.json({
        success: false,
        error: 'Runtime Error',
        runtimeError: joinLines(godboltResult.stderr) || `Program exited with code ${godboltResult.code}`,
        exitCode: godboltResult.code,
      }, { status: 200 });
    }

    const stdout = joinLines(godboltResult.stdout);
    const actualOutputs = parseOutput(stdout, validTestCases.length);
    const results: TestCaseResult[] = [];
    let allPassed = true;

    for (let i = 0; i < validTestCases.length; i++) {
      const expected = validTestCases[i].expectedOutput;
      const actual = actualOutputs[i] || '';
      const passed = normalizeForComparison(actual) === normalizeForComparison(expected);

      if (!passed) allPassed = false;

      results.push({
        testCase: i + 1,
        input: validTestCases[i].input,
        expectedOutput: expected,
        actualOutput: actual,
        passed,
      });
    }

    return NextResponse.json({
      success: true,
      allPassed,
      results,
      totalTests: validTestCases.length,
      passedTests: results.filter(r => r.passed).length,
      stderr: joinLines(godboltResult.stderr) || undefined,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to run code: ${message}` },
      { status: 500 }
    );
  }
}
