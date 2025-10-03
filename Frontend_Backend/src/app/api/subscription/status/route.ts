import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getPlanLimit } from '@/lib/subscription';

export async function GET() {
  try {
    await connectDB();
    
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const plan = user.subscription?.plan || 'free';
    const problemLimit = getPlanLimit(plan as any);
    const problemCount = user.stats?.totalProblems || 0;
    const remainingProblems = Math.max(0, problemLimit - problemCount);

    return NextResponse.json({
      success: true,
      plan,
      problemLimit,
      problemCount,
      remainingProblems,
      canAddMore: problemCount < problemLimit,
      subscriptionActive: user.subscription?.stripeCurrentPeriodEnd 
        ? new Date(user.subscription.stripeCurrentPeriodEnd) > new Date()
        : false
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
