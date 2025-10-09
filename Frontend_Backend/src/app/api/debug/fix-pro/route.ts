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
    
    // Force update user to Pro plan
    await client.users.updateUser(userId, {
      publicMetadata: {
        subscriptionPlan: 'pro',
        subscriptionStatus: 'active',
        updatedAt: new Date().toISOString(),
      }
    });

    console.log(`✅ Force updated user ${userId} to PRO plan`);

    return NextResponse.json({
      success: true,
      message: 'Successfully updated to PRO plan',
      plan: 'pro',
      limit: 2000
    });

  } catch (error) {
    console.error('❌ Error updating user plan:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update plan',
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
      userId,
      publicMetadata: user.publicMetadata,
      subscriptionPlan: user.publicMetadata?.subscriptionPlan || 'NOT SET',
      subscriptionStatus: user.publicMetadata?.subscriptionStatus || 'NOT SET',
    });

  } catch (error) {
    console.error('❌ Error fetching user metadata:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch metadata',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}