import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Problem from '@/lib/models/Problem';
import {
  processProblemsForRevision,
  sortByPriority,
  getProblemsNeedingRevision,
  groupByConfidenceLevel,
  getRevisionStats
} from '@/utils/revisionAlgorithm';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

   
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'priority'; 
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');

   
    const query: Record<string, unknown> = { userId };    
    if (category && category !== 'all') {
      query.category = category;
    }

    const problems = await Problem.find(query).lean();

    if (!problems || problems.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          problems: [],
          stats: {
            total: 0,
            urgent: 0,
            high: 0,
            medium: 0,
            low: 0,
            avgConfidence: 0,
            avgDaysSinceRevision: 0,
            needsImmediateRevision: 0
          }
        }
      });
    }

    
    const processedProblems = processProblemsForRevision(
      problems.map(p => ({
        _id: String(p._id),
        title: p.title,
        category: p.category,
        Confidence: p.Confidence,
        lastRevised: p.lastRevised || p.createdAt,
        revisionCount: p.revisionCount || 0,
        createdAt: p.createdAt
      }))
    );

    // Get statistics
    const stats = getRevisionStats(processedProblems);

    // Filter based on mode
    let filteredProblems;
    switch (mode) {
      case 'urgent':
        // Only problems with adjusted confidence < 6
        filteredProblems = processedProblems.filter(p => p.adjustedConfidence < 6);
        filteredProblems = sortByPriority(filteredProblems).slice(0, limit);
        break;
      
      case 'needsRevision':
        // Problems that need revision based on criteria
        filteredProblems = getProblemsNeedingRevision(processedProblems, {
          minConfidence: 7,
          minDaysSinceRevision: 7,
          maxProblems: limit
        });
        break;
      
      case 'all':
        // All problems sorted by priority
        filteredProblems = sortByPriority(processedProblems).slice(0, limit);
        break;
      
      case 'priority':
      default:
        // Smart selection: prioritize low confidence and not recently revised
        filteredProblems = getProblemsNeedingRevision(processedProblems, {
          minConfidence: 7,
          minDaysSinceRevision: 5,
          maxProblems: limit
        });
        break;
    }

    // Group by confidence level for UI display
    const groupedProblems = groupByConfidenceLevel(filteredProblems);

    return NextResponse.json({
      success: true,
      data: {
        problems: filteredProblems,
        grouped: groupedProblems,
        stats,
        mode,
        total: filteredProblems.length
      }
    });

  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch revision problems',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Update last revised date when a problem is revised
export async function PATCH(request: Request) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { problemId, confidence } = await request.json();

    if (!problemId) {
      return NextResponse.json(
        { success: false, error: 'Problem ID is required' },
        { status: 400 }
      );
    }

    // Find and update the problem
    const problem = await Problem.findOne({ _id: problemId, userId });

    if (!problem) {
      return NextResponse.json(
        { success: false, error: 'Problem not found' },
        { status: 404 }
      );
    }

    // Update revision data
    problem.lastRevised = new Date();
    problem.revisionCount = (problem.revisionCount || 0) + 1;
    
    if (confidence !== undefined && confidence >= 1 && confidence <= 10) {
      problem.Confidence = confidence;
    }

    await problem.save();

    return NextResponse.json({
      success: true,
      data: {
        problemId: problem._id,
        lastRevised: problem.lastRevised,
        revisionCount: problem.revisionCount,
        confidence: problem.Confidence
      }
    });

  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update revision',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
