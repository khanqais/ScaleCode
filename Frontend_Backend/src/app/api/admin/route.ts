import { auth } from '@clerk/nextjs/server'
import Problem from '@/lib/models/Problem'
import User from '@/lib/models/User'
import { createClerkClient } from '@clerk/backend'
import connectDB from '@/lib/db'

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export async function GET() {
  try {
    // Connect to database
    await connectDB()

    const { userId } = await auth()

    if (!userId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminIds = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(',') || []
    if (!adminIds.includes(userId)) {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all problems
    const allProblems = await Problem.find({}).lean()

    // Group by userId
    const userProblemsMap: Record<string, typeof allProblems> = {}
    for (const problem of allProblems) {
      if (!userProblemsMap[problem.userId]) {
        userProblemsMap[problem.userId] = []
      }
      userProblemsMap[problem.userId].push(problem)
    }

    // Fetch user details from Clerk and build stats
    const users = []
    for (const [userIdKey, problems] of Object.entries(userProblemsMap)) {
      try {
        const clerkUser = await clerkClient.users.getUser(userIdKey)
        const categories = new Set(problems.map((p: any) => p.category))
        const confidences = problems
          .filter((p: any) => p.Confidence !== undefined)
          .map((p: any) => p.Confidence)
        const avgConfidence =
          confidences.length > 0
            ? (confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length).toFixed(2)
            : 0

        const categoryBreakdown: Record<string, number> = {}
        for (const problem of problems) {
          categoryBreakdown[problem.category] = (categoryBreakdown[problem.category] || 0) + 1
        }

        const lastProblemDate = problems.length > 0
          ? new Date(Math.max(...problems.map((p: any) => new Date(p.createdAt).getTime())))
          : null

        users.push({
          userId: userIdKey,
          email: clerkUser.emailAddresses[0]?.emailAddress || 'N/A',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          totalProblems: problems.length,
          categories: categories.size,
          averageConfidence: parseFloat(String(avgConfidence)),
          lastProblemDate: lastProblemDate?.toISOString() || null,
          categoryBreakdown,
        })
      } catch (error) {
        // Skip users that can't be found in Clerk
        console.warn(`Failed to fetch Clerk user ${userIdKey}:`, error)
        continue
      }
    }

    // Calculate summary stats
    const totalProblems = allProblems.length
    const totalUsers = users.length

    return Response.json({
      success: true,
      data: {
        totalUsers,
        totalProblems,
        users: users.sort((a, b) => b.totalProblems - a.totalProblems),
      },
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return Response.json(
      { success: false, error: 'Failed to fetch admin statistics' },
      { status: 500 }
    )
  }
}
