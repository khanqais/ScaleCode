import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/db'
import Problem from '@/lib/models/Problem'

interface ProblemLeanDoc {
  _id: unknown
  userId: string
  category: string
  Confidence: number
  createdAt: Date
  __v?: number
}

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

    const problems = await Problem.find({ userId }).lean() as ProblemLeanDoc[]
    const totalProblems = problems.length
    
    const categories = [...new Set(problems.map((p) => p.category))].length
    
    const averageConfidence = totalProblems > 0
      ? problems.reduce((sum: number, p) => sum + p.Confidence, 0) / totalProblems
      : 0

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const recentActivity = problems.filter((p) => p.createdAt > weekAgo).length

    const categoryStats = problems.reduce((acc: Record<string, number>, problem) => {
      acc[problem.category] = (acc[problem.category] || 0) + 1
      return acc
    }, {})

    const stats = {
      totalProblems,
      categories,
      averageConfidence: Math.round(averageConfidence * 10) / 10,
      recentActivity,
      categoryStats,
      confidenceStats: {
        low: problems.filter((p) => p.Confidence <= 3).length,
        medium: problems.filter((p) => p.Confidence >= 4 && p.Confidence <= 7).length,
        high: problems.filter((p) => p.Confidence >= 8).length
      }
    }

    const response = NextResponse.json({
      success: true,
      data: stats
    })

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response

  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
