import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Problem from '@/lib/models/Problem';

interface ProblemDoc {
  category: string;
  difficulty: number;
  createdAt: Date;
}

export async function GET() {
  try {
    await connectDB();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const problems: ProblemDoc[] = await Problem.find({ userId });
    const totalProblems = problems.length;
    
    const categories = [...new Set(problems.map((p) => p.category))].length;
    
    const averageDifficulty = totalProblems > 0
      ? problems.reduce((sum: number, p) => sum + p.difficulty, 0) / totalProblems
      : 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentActivity = problems.filter((p) => p.createdAt > weekAgo).length;

    // Category distribution
    const categoryStats = problems.reduce((acc: Record<string, number>, problem) => {
      acc[problem.category] = (acc[problem.category] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      totalProblems,
      categories,
      averageDifficulty: Math.round(averageDifficulty * 10) / 10,
      recentActivity,
      categoryStats,
      difficultyStats: {
        easy: problems.filter((p) => p.difficulty <= 3).length,
        medium: problems.filter((p) => p.difficulty >= 4 && p.difficulty <= 7).length,
        hard: problems.filter((p) => p.difficulty >= 8).length
      }
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error: unknown) {
    console.error('Get user stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}