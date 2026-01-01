import { auth } from '@/auth'
import Problem from '@/lib/models/Problem'
import User from '@/lib/models/User'
import connectDB from '@/lib/db'

export async function GET() {
  try {
    // Connect to database
    await connectDB()

    const session = await auth()

    if (!session?.user?.id) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminIds = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(',') || []
    if (!adminIds.includes(session.user.id)) {
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

    // Fetch user details from database and build stats
    interface UserWithStats {
      userId: string
      email: string
      name: string
      totalProblems: number
      categories: number
      averageConfidence: number
      lastProblemDate: string | null
      categoryBreakdown: Record<string, number>
    }
    const users: UserWithStats[] = []
    for (const [userIdKey, problems] of Object.entries(userProblemsMap)) {
      try {
        const dbUser = await User.findById(userIdKey)
        const categories = new Set(problems.map((p: Record<string, unknown>) => p.category))
        const confidences = problems
          .filter((p: Record<string, unknown>) => p.Confidence !== undefined)
          .map((p: Record<string, unknown>) => p.Confidence as number)
        const avgConfidence =
          confidences.length > 0
            ? (confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length).toFixed(2)
            : 0

        const categoryBreakdown: Record<string, number> = {}
        for (const problem of problems) {
          const category = (problem as Record<string, unknown>).category as string
          categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1
        }

        const lastProblemDate = problems.length > 0
          ? new Date(Math.max(...problems.map((p: Record<string, unknown>) => new Date(p.createdAt as string).getTime())))
          : null

        users.push({
          userId: userIdKey,
          email: dbUser?.email || 'N/A',
          name: dbUser ? `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() : 'Unknown User',
          totalProblems: problems.length,
          categories: categories.size,
          averageConfidence: parseFloat(String(avgConfidence)),
          lastProblemDate: lastProblemDate?.toISOString() || null,
          categoryBreakdown,
        })
      } catch (error) {
        // Skip users that can't be found (deleted users)
        console.error(`Error fetching user ${userIdKey}:`, error)
        continue
      }
    }

    // Calculate summary stats
    const totalProblems = users.reduce((sum, user) => sum + user.totalProblems, 0)
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
