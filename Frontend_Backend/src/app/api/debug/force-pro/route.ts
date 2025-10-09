import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const client = await clerkClient();
    
    console.log(`🔧 FORCE FIXING PRO PLAN FOR USER: ${userId}`);
    
    // Force update user to Pro plan
    await client.users.updateUser(userId, {
      publicMetadata: {
        subscriptionPlan: 'pro',
        subscriptionStatus: 'active',
        updatedAt: new Date().toISOString(),
        forcedUpdate: true
      }
    });

    console.log(`✅ SUCCESSFULLY FORCE UPDATED USER ${userId} TO PRO PLAN`);

    return NextResponse.json({
      success: true,
      message: 'FORCE UPDATED TO PRO PLAN - Your limit is now 2000!',
      plan: 'pro',
      limit: 2000,
      userId
    });

  } catch (error) {
    console.error('❌ Error force updating to pro:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update to pro',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    return NextResponse.json({
      success: true,
      currentState: {
        userId,
        subscriptionPlan: user.publicMetadata?.subscriptionPlan || 'NOT SET',
        subscriptionStatus: user.publicMetadata?.subscriptionStatus || 'NOT SET',
        allMetadata: user.publicMetadata
      }
    });

  } catch (error) {
    console.error('❌ Error checking pro status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}