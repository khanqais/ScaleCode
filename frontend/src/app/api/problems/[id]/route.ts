import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Problem from '@/lib/models/Problem';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    const problem = await Problem.findOne({ _id: id, userId });

    if (!problem) {
      return NextResponse.json({
        success: false,
        error: 'Problem not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: problem
    });

  } catch (error: unknown) {
    console.error('Get problem error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch problem',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const problem = await Problem.findOneAndUpdate(
      { _id: id, userId },
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!problem) {
      return NextResponse.json({
        success: false,
        error: 'Problem not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Problem updated successfully',
      data: problem
    });

  } catch (error: unknown) {
    console.error('Update problem error:', error);
    
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    const problem = await Problem.findOneAndDelete({ _id: id, userId });

    if (!problem) {
      return NextResponse.json({
        success: false,
        error: 'Problem not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Problem deleted successfully'
    });

  } catch (error: unknown) {
    console.error('Delete problem error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete problem',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}