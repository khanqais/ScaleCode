import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Problem from '@/lib/models/Problem';
import User from '@/lib/models/User';

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
    
    console.log(`📈 Updated stats for user ${userId}: ${totalProblems} problems, avg difficulty ${averageDifficulty}`);
  } catch (error) {
    console.error('❌ Error updating user stats:', error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    console.log('🔍 Fetching problem:', id, 'for user:', userId);

    const problem = await Problem.findOne({ _id: id, userId });

    if (!problem) {
      console.log('❌ Problem not found:', id);
      return NextResponse.json({
        success: false,
        error: 'Problem not found'
      }, { status: 404 });
    }

    console.log('✅ Problem found:', problem.title);

    const response = NextResponse.json({
      success: true,
      data: problem
    });

    // DISABLE CACHING
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error: unknown) {
    console.error('❌ Get problem error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch problem',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    console.log('✏️ Updating problem:', id, 'for user:', userId);

    const problem = await Problem.findOneAndUpdate(
      { _id: id, userId },
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!problem) {
      console.log('❌ Problem not found for update:', id);
      return NextResponse.json({
        success: false,
        error: 'Problem not found'
      }, { status: 404 });
    }

    console.log('✅ Problem updated successfully:', problem.title);

    const response = NextResponse.json({
      success: true,
      message: 'Problem updated successfully',
      data: problem
    });

    // DISABLE CACHING
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error: unknown) {
    console.error('❌ Update problem error:', error);
    
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
      error: 'Failed to update problem',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    console.log('🗑️ Deleting problem:', id, 'for user:', userId);

    const problem = await Problem.findOneAndDelete({ _id: id, userId });

    if (!problem) {
      console.log('❌ Problem not found for deletion:', id);
      return NextResponse.json({
        success: false,
        error: 'Problem not found'
      }, { status: 404 });
    }

    console.log('✅ Problem deleted successfully:', problem.title);

    // Update user stats after deletion
    await updateUserStats(userId);

    const response = NextResponse.json({
      success: true,
      message: 'Problem deleted successfully'
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
