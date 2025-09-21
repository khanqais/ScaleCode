import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Problem from '@/lib/models/Problem';
import User from '@/lib/models/User';

// Helper function to ensure user exists
async function ensureUserExists(userId: string) {
  try {
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      user = new User({
        clerkId: userId,
        email: '',
        firstName: '',
        lastName: '',
      });
      await user.save();
    }
    return user;
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    throw error;
  }
}

// Helper function to update user stats
async function updateUserStats(userId: string) {
  try {
    const problems = await Problem.find({ userId });
    const totalProblems = problems.length;
    const averageDifficulty = totalProblems > 0 
      ? problems.reduce((sum: number, p: { difficulty: number }) => sum + p.difficulty, 0) / totalProblems 
      : 0;

    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        'stats.totalProblems': totalProblems,
        'stats.averageDifficulty': Math.round(averageDifficulty * 10) / 10,
        'stats.lastActive': new Date()
      }
    );
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, problemStatement, myCode, intuition, difficulty, category } = body;

    // Validation
    if (!title || !problemStatement || !myCode || !difficulty || !category) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        required: ['title', 'problemStatement', 'myCode', 'difficulty', 'category']
      }, { status: 400 });
    }

    // Ensure user exists in database before creating problem
    await ensureUserExists(userId);

    // Create problem
    const problem = new Problem({
      userId,
      title: title.trim(),
      problemStatement: problemStatement.trim(),
      myCode: myCode.trim(),
      intuition: intuition?.trim() || '',
      difficulty: parseInt(difficulty),
      category,
    });

    const savedProblem = await problem.save();

    // Update user stats
    await updateUserStats(userId);

    return NextResponse.json({
      success: true,
      message: 'Problem created successfully',
      data: savedProblem
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Create problem error:', error);
    
    // Handle specific validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        message: error.message,
        details: (error as any).errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create problem',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Build filter query
    const filter: Record<string, any> = { userId };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = parseInt(difficulty);
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { problemStatement: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [problems, total] = await Promise.all([
      Problem.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Problem.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        problems,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error: unknown) {
    console.error('Get problems error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch problems',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}