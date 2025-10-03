import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Problem from '@/lib/models/Problem';
import User from '@/lib/models/User';


async function getUserPlan(userId: string) {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    
    const subscriptionPlan = user.publicMetadata?.subscriptionPlan as string || 'free';
    
    return subscriptionPlan; 
  } catch (error) {
    console.error('❌ Error getting user plan:', error);
    return 'free'; 
  }
}


function getProblemLimit(plan: string): number {
  const limits: Record<string, number> = {
    'free': 50,
    'pro': 500,
    'pro_max': 2000
  };
  return limits[plan] || 50;
}

async function ensureUserExists(userId: string) {
  try {
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
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
    }
    return user;
  } catch (error) {
    console.error(' Error ensuring user exists:', error);
    throw error;
  }
}

async function updateUserStats(userId: string) {
  try {
    
    const problems = await Problem.find({ userId });
    const totalProblems = problems.length;
    const averageConfidence = totalProblems > 0 
      ? problems.reduce((sum: number, p: { Confidence: number }) => sum + p.Confidence, 0) / totalProblems 
      : 0;

    

    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        'stats.totalProblems': totalProblems,
        'stats.averageConfidence': Math.round(averageConfidence * 10) / 10,
        'stats.lastActive': new Date()
      }
    );

   
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

   
    const userPlan = await getUserPlan(userId);
    const problemLimit = getProblemLimit(userPlan);
    const currentProblemCount = await Problem.countDocuments({ userId });

    
    if (currentProblemCount >= problemLimit) {
      return NextResponse.json({
        success: false,
        error: 'Problem limit reached',
        message: `You've reached your ${userPlan} plan limit of ${problemLimit} problems. Please upgrade to add more.`,
        limitReached: true,
        currentPlan: userPlan,
        currentCount: currentProblemCount,
        limit: problemLimit
      }, { status: 403 });
    }

    const body = await request.json();
    
    
    const { title, problemStatement, myCode, intuition, Confidence, category } = body;

    
    if (!title || !problemStatement || !myCode || !Confidence || !category) {
      const missingFields = [];
      if (!title) missingFields.push('title');
      if (!problemStatement) missingFields.push('problemStatement');
      if (!myCode) missingFields.push('myCode');
      if (!Confidence) missingFields.push('Confidence');
      if (!category) missingFields.push('category');
      
      console.error(' Missing fields:', missingFields);
      
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        missingFields,
        required: ['title', 'problemStatement', 'myCode', 'Confidence', 'category']
      }, { status: 400 });
    }

    await ensureUserExists(userId);

    const problem = new Problem({
      userId,
      title: title.trim(),
      problemStatement: problemStatement.trim(),
      myCode: myCode.trim(),
      intuition: intuition?.trim() || '',
      Confidence: parseInt(Confidence),
      category,
    });

    
    const savedProblem = await problem.save();
    

    
    await updateUserStats(userId);

    const response = NextResponse.json({
      success: true,
      message: 'Problem created successfully',
      data: savedProblem,
     
      usage: {
        currentCount: currentProblemCount + 1,
        limit: problemLimit,
        plan: userPlan,
        remaining: problemLimit - currentProblemCount - 1
      }
    }, { status: 201 });

    
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error: unknown) {
    console.error('❌ Create problem error:', error);
    
    
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

    

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    
    const filter: Record<string, unknown> = { userId };
    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { problemStatement: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    
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

   
    await updateUserStats(userId);

    const response = NextResponse.json({
      success: true,
      message: 'Problem deleted successfully',
      data: deletedProblem
    });

  
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error: unknown) {
    console.error('Delete problem error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete problem',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
