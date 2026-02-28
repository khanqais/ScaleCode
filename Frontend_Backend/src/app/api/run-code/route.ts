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

// ─── Wandbox API (100% free, no API key, no rate limits) ─────────────────────
// https://github.com/melpon/wandbox/blob/master/kennel2/API.md
const WANDBOX_URL = 'https://wandbox.org/api/compile.json';

interface WandboxResponse {
  status: string;            // "0" on success
  program_output?: string;   // stdout
  program_error?: string;    // stderr from program
  compiler_error?: string;   // compiler errors/warnings
  compiler_message?: string; // full compiler messages
  signal?: string;           // e.g. "Killed" on TLE
  program_message?: string;  // combined program output
}

interface TestCaseResult {
  testCase: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
}

// ─── POST /api/run-code ───────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Auth check
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

    // Validate test cases exist
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

    // Filter to test cases that have rawInput
    const validTestCases = testCases.filter(tc => tc.rawInput && tc.expectedOutput);
    if (validTestCases.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid test cases with raw input data' },
        { status: 400 }
      );
    }

    // Parse function signature from stored C++ template
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

    // Generate the full C++ program
    let fullProgram: string;
    try {
      fullProgram = generateCppProgram(userCode, signature);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: `Driver generation failed: ${err instanceof Error ? err.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    // Build stdin
    const stdin = buildStdin(validTestCases);

    // Execute via Wandbox API
    let wandboxResult: WandboxResponse;
    try {
      const wandboxRes = await fetch(WANDBOX_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: fullProgram,
          compiler: 'gcc-head',
          options: 'warning,gnu++17',
          stdin: stdin,
          'compiler-option-raw': '-O2',
          'runtime-option-raw': '',
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!wandboxRes.ok) {
        const text = await wandboxRes.text();
        return NextResponse.json(
          { success: false, error: `Code execution service error (${wandboxRes.status}): ${text}` },
          { status: 502 }
        );
      }

      wandboxResult = await wandboxRes.json() as WandboxResponse;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('timed out') || msg.includes('AbortError')) {
        return NextResponse.json(
          { success: false, error: 'Code execution timed out. The execution service may be unavailable.' },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Failed to reach code execution service: ${msg}` },
        { status: 502 }
      );
    }

    // Check for compilation errors (status !== "0" and no program_output usually means compile fail)
    const compilerError = wandboxResult.compiler_error || '';
    const hasCompileError = compilerError.toLowerCase().includes('error');
    
    if (hasCompileError && !wandboxResult.program_output) {
      return NextResponse.json({
        success: false,
        error: 'Compilation Error',
        compileError: compilerError || wandboxResult.compiler_message || 'Unknown compilation error',
      }, { status: 200 });
    }

    // Check for runtime errors / signals
    if (wandboxResult.signal) {
      const sig = wandboxResult.signal.toLowerCase();
      if (sig.includes('kill') || sig.includes('timeout')) {
        return NextResponse.json({
          success: false,
          error: 'Time Limit Exceeded',
          runtimeError: 'Your solution exceeded the time limit.',
        }, { status: 200 });
      }
      return NextResponse.json({
        success: false,
        error: 'Runtime Error',
        runtimeError: wandboxResult.program_error || `Signal: ${wandboxResult.signal}`,
        exitCode: parseInt(wandboxResult.status) || 1,
      }, { status: 200 });
    }

    // Non-zero exit status with no signal
    if (wandboxResult.status !== '0' && wandboxResult.status !== undefined) {
      const statusNum = parseInt(wandboxResult.status);
      if (statusNum !== 0 && !isNaN(statusNum)) {
        return NextResponse.json({
          success: false,
          error: 'Runtime Error',
          runtimeError: wandboxResult.program_error || 'Program exited with non-zero status',
          exitCode: statusNum,
        }, { status: 200 });
      }
    }

    // Parse outputs and compare
    const stdout = wandboxResult.program_output || '';
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
      stderr: wandboxResult.program_error || undefined,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to run code: ${message}` },
      { status: 500 }
    );
  }
}
