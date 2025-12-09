import { auth } from '@clerk/nextjs/server'
import Problem from '@/lib/models/Problem'
import connectDB from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
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

    const { userId: targetUserId } = await params

    // Fetch problems for the specific user
    const problems = await Problem.find({ userId: targetUserId })
      .select('title problemStatement solutions createdAt category')
      .sort({ createdAt: -1 })
      .lean()

    interface ProblemData {
      _id: { toString(): string }
      title: string
      problemStatement: string
      solutions?: Array<{
        code: string
        language: string
        intuition: string
        approach: string
        timeComplexity: string
        spaceComplexity: string
      }>
      category: string
      createdAt: Date
    }

    return Response.json({
      success: true,
      data: {
        problems: problems.map((problem: ProblemData) => ({
          id: problem._id.toString(),
          title: problem.title,
          problemStatement: problem.problemStatement,
          solutions: problem.solutions || [],
          category: problem.category,
          createdAt: problem.createdAt,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching user problems:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch user problems' },
      { status: 500 }
    )
  }
}
