import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/db'
import Problem from '@/lib/models/Problem'

export async function GET() {
  try {
    await connectDB();
    
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;

    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [statsResult, categoryResult, confidenceResult, recentResult] = await Promise.all([
      
      Problem.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalProblems: { $sum: 1 },
            averageConfidence: { $avg: '$Confidence' },
            categories: { $addToSet: '$category' }
          }
        }
      ]),
      
      Problem.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      
      Problem.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            low: { $sum: { $cond: [{ $lte: ['$Confidence', 3] }, 1, 0] } },
            medium: { $sum: { $cond: [{ $and: [{ $gte: ['$Confidence', 4] }, { $lte: ['$Confidence', 7] }] }, 1, 0] } },
            high: { $sum: { $cond: [{ $gte: ['$Confidence', 8] }, 1, 0] } }
          }
        }
      ]),
      
      Problem.countDocuments({ userId, createdAt: { $gt: weekAgo } })
    ]);

    const mainStats = statsResult[0] || { totalProblems: 0, averageConfidence: 0, categories: [] };
    const confidenceStats = confidenceResult[0] || { low: 0, medium: 0, high: 0 };
    
    
    const categoryStats = categoryResult.reduce((acc: Record<string, number>, item: { _id: string; count: number }) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const stats = {
      totalProblems: mainStats.totalProblems,
      categories: mainStats.categories.length,
      averageConfidence: Math.round((mainStats.averageConfidence || 0) * 10) / 10,
      recentActivity: recentResult,
      categoryStats,
      confidenceStats: {
        low: confidenceStats.low,
        medium: confidenceStats.medium,
        high: confidenceStats.high
      }
    };

    const response = NextResponse.json({
      success: true,
      data: stats
    });

    
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    
    return response;

  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
