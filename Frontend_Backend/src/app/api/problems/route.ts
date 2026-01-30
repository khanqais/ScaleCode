import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Problem from '@/lib/models/Problem';
import User from '@/lib/models/User';


async function getUserPlan(userId: string) {
  try {
    const user = await User.findById(userId);
    return user?.subscriptionPlan as string || 'free'; 
  } catch {
    return 'free'; 
  }
}

function getProblemLimit(plan: string): number {
  const limits: Record<string, number> = {
    'free': 100,          
    'pro': 2000,           
    'pro_max': 4000       
  };
  
  return limits[plan] || 100;
}

async function ensureUserExists(userId: string, email?: string, firstName?: string, lastName?: string, profileImage?: string) {
  try {
    let user = await User.findById(userId);
    if (!user) {
      user = new User({
        _id: userId,
        email: email || '',
        firstName: firstName || '',
        lastName: lastName || '',
        profileImage: profileImage || ''
      });
      await user.save();
    }
    return user;
  } catch (_error) {
    throw _error;
  }
}

async function updateUserStats(userId: string) {
  try {
    const stats = await Problem.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalProblems: { $sum: 1 },
          averageConfidence: { $avg: '$Confidence' }
        }
      }
    ]);

    const { totalProblems = 0, averageConfidence = 0 } = stats[0] || {};

    await User.findByIdAndUpdate(
      userId,
      {
        'stats.totalProblems': totalProblems,
        'stats.averageConfidence': Math.round(averageConfidence * 10) / 10,
        'stats.lastActive': new Date()
      }
    );
  } catch {
    
  }
}

export async function POST(request: NextRequest) {
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
    
    
    const { title, problemStatement, problemImages, myCode, intuition, Confidence, category, tags, solutions } = body;

    
    if (!title || !problemStatement || !Confidence || !category) {
      const missingFields = [];
      if (!title) missingFields.push('title');
      if (!problemStatement) missingFields.push('problemStatement');
      if (!Confidence) missingFields.push('Confidence');
      if (!category) missingFields.push('category');
      
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        missingFields,
        required: ['title', 'problemStatement', 'Confidence', 'category']
      }, { status: 400 });
    }

    // Validate at least one solution exists
    if (!solutions || solutions.length === 0) {
      if (!myCode) {
        return NextResponse.json({
          success: false,
          error: 'At least one solution is required'
        }, { status: 400 });
      }
    } else if (!solutions[0]?.code) {
      return NextResponse.json({
        success: false,
        error: 'First solution must have code'
      }, { status: 400 });
    }

    await ensureUserExists(userId, session.user.email, session.user.firstName, session.user.lastName, session.user.image);

    const problem = new Problem({
      userId,
      title: title.trim(),
      problemStatement: problemStatement.trim(),
      problemImages: problemImages || [],
      myCode: myCode?.trim() || solutions?.[0]?.code || '',
      intuition: intuition?.trim() || solutions?.[0]?.intuition || '',
      solutions: solutions || [],
      Confidence: parseInt(Confidence),
      category,
      tags: tags || [],
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
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;

    

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


    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error: unknown) {
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
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;

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
    return NextResponse.json({
      success: false,
      error: 'Failed to delete problem',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
