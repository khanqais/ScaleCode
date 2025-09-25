import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Problem from '@/lib/models/Problem';
import User from '@/lib/models/User';

// Helper function to ensure user exists
async function ensureUserExists(userId: string) {
  try {
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      console.log('👤 Creating new user for:', userId);
      // Get user info from Clerk
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      
      user = new User({
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        profileImage: clerkUser.imageUrl || ''
      });
      await user.save();
      console.log('✅ New user created');
    }
    return user;
  } catch (error) {
    console.error('❌ Error ensuring user exists:', error);
    throw error;
  }
}

async function updateUserStats(userId: string) {
  try {
    console.log('📊 Updating user stats for:', userId);
    const problems = await Problem.find({ userId });
    const totalProblems = problems.length;
    const averageDifficulty = totalProblems > 0 
      ? problems.reduce((sum: number, p: { difficulty: number }) => sum + p.difficulty, 0) / totalProblems 
      : 0;

    console.log(`📈 Calculated stats: ${totalProblems} problems, avg difficulty ${averageDifficulty}`);

    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        'stats.totalProblems': totalProblems,
        'stats.averageDifficulty': Math.round(averageDifficulty * 10) / 10,
        'stats.lastActive': new Date()
      }
    );

    console.log('✅ User stats updated successfully');
  } catch (error) {
    console.error('❌ Error updating user stats:', error);
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

    console.log('🔍 Creating problem for user:', userId);

    const body = await request.json();
    const { title, problemStatement, myCode, intuition, difficulty, category } = body;

    console.log('📝 Problem data:', { title, category, difficulty });

    // Validation
    if (!title || !problemStatement || !myCode || !difficulty || !category) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        required: ['title', 'problemStatement', 'myCode', 'difficulty', 'category']
      }, { status: 400 });
    }

    await ensureUserExists(userId);

    const problem = new Problem({
      userId,
      title: title.trim(),
      problemStatement: problemStatement.trim(),
      myCode: myCode.trim(),
      intuition: intuition?.trim() || '',
      difficulty: parseInt(difficulty),
      category,
    });

    console.log('💾 Saving problem to database...');
    const savedProblem = await problem.save();
    console.log('✅ Problem saved with ID:', savedProblem._id);

    // Update user stats AFTER saving problem
    await updateUserStats(userId);

    const response = NextResponse.json({
      success: true,
      message: 'Problem created successfully',
      data: savedProblem
    }, { status: 201 });

    // DISABLE CACHING
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error: unknown) {
    console.error('❌ Create problem error:', error);
    
    // Handle specific validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        message: error.message,
        details: (error as Error & { errors: unknown }).errors
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

    console.log('🔍 Fetching problems for user:', userId);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    console.log('📋 Query params:', { page, limit, category, difficulty, search, sortBy, order });

    // Build filter query
    const filter: Record<string, unknown> = { userId };
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

    

    const response = NextResponse.json({
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

    // DISABLE CACHING
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (error: unknown) {
    console.error('❌ Get problems error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch problems',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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
    const problemId = searchParams.get('id');

    if (!problemId) {
      return NextResponse.json({
        success: false,
        error: 'Problem ID is required'
      }, { status: 400 });
    }

    console.log('🗑️ Deleting problem:', problemId, 'for user:', userId);

    // Find and delete the problem, ensuring it belongs to the user
    const deletedProblem = await Problem.findOneAndDelete({
      _id: problemId,
      userId: userId
    });

    if (!deletedProblem) {
      console.log(' Problem not found for deletion:', problemId);
      return NextResponse.json({
        success: false,
        error: 'Problem not found or you do not have permission to delete it'
      }, { status: 404 });
    }

    console.log('✅ Problem deleted:', deletedProblem.title);

    // Update user stats after deletion
    await updateUserStats(userId);

    const response = NextResponse.json({
      success: true,
      message: 'Problem deleted successfully',
      data: deletedProblem
    });

    // DISABLE CACHING
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error: unknown) {
    console.error('❌ Delete problem error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete problem',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
