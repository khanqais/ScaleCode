import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Problem from '@/lib/models/Problem';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const problems = await Problem.find({ userId });
    const totalProblems = problems.length;
    
    const categories = [...new Set(problems.map((p: any) => p.category))].length;
    
    const averageDifficulty = totalProblems > 0
      ? problems.reduce((sum: number, p: any) => sum + p.difficulty, 0) / totalProblems
      : 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentActivity = problems.filter((p: any) => p.createdAt > weekAgo).length;

    // Category distribution
    const categoryStats = problems.reduce((acc: any, problem: any) => {
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
        easy: problems.filter((p: any) => p.difficulty <= 3).length,
        medium: problems.filter((p: any) => p.difficulty >= 4 && p.difficulty <= 7).length,
        hard: problems.filter((p: any) => p.difficulty >= 8).length
      }
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('Get user stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user stats',
      message: error.message
    }, { status: 500 });
  }
}