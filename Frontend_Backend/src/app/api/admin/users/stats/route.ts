import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import connectDB from '@/lib/db'
import Problem from '@/lib/models/Problem'

const ADMIN_IDS = process.env.ADMIN_USER_IDS?.split(',') || [];

export async function GET() {
  try {
    await connectDB();
    
    const { userId } = await auth();
    
    if (!userId || !ADMIN_IDS.includes(userId)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all problems grouped by userId
    const allProblems = await Problem.find({}).lean();
    
    // Get unique user IDs
    const uniqueUserIds = [...new Set(allProblems.map((p: any) => p.userId))];

    // Fetch user details from Clerk
    const clerk = await clerkClient();
    const userDetailsMap: Record<string, { email: string; name: string }> = {};

    for (const userId of uniqueUserIds) {
      try {
        const user = await clerk.users.getUser(userId);
        userDetailsMap[userId] = {
          email: user.emailAddresses[0]?.emailAddress || 'N/A',
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.firstName || user.emailAddresses[0]?.emailAddress || 'Unknown'
        };
      } catch (error) {
        console.error(`Failed to fetch user ${userId}:`, error);
        userDetailsMap[userId] = {
          email: 'User Deleted',
          name: 'Unknown User'
        };
      }
    }

    // Group problems by userId and calculate stats
    const userStats: Record<string, {
      userId: string
      email: string
      name: string
      totalProblems: number
      categories: number
      averageConfidence: number
      lastProblemDate: Date | null
      categoryBreakdown: Record<string, number>
    }> = {};

    allProblems.forEach((problem: any) => {
      if (!userStats[problem.userId]) {
        const userDetail = userDetailsMap[problem.userId];
        userStats[problem.userId] = {
          userId: problem.userId,
          email: userDetail.email,
          name: userDetail.name,
          totalProblems: 0,
          categories: 0,
          averageConfidence: 0,
          lastProblemDate: null,
          categoryBreakdown: {}
        };
      }

      const userStat = userStats[problem.userId];
      userStat.totalProblems++;
      
      if (!userStat.categoryBreakdown[problem.category]) {
        userStat.categoryBreakdown[problem.category] = 0;
      }
      userStat.categoryBreakdown[problem.category]++;

      // Track last problem date
      if (!userStat.lastProblemDate || new Date(problem.createdAt) > userStat.lastProblemDate) {
        userStat.lastProblemDate = new Date(problem.createdAt);
      }
    });

    // Calculate additional stats
    Object.values(userStats).forEach((stat) => {
      stat.categories = Object.keys(stat.categoryBreakdown).length;
      
      const userProblems = allProblems.filter((p: any) => p.userId === stat.userId);
      stat.averageConfidence = userProblems.length > 0
        ? Math.round((userProblems.reduce((sum: number, p: any) => sum + p.Confidence, 0) / userProblems.length) * 10) / 10
        : 0;
    });

    // Sort by total problems (descending)
    const sortedStats = Object.values(userStats).sort((a, b) => b.totalProblems - a.totalProblems);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: sortedStats.length,
        totalProblems: allProblems.length,
        users: sortedStats
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
