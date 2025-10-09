import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan || !['free', 'pro', 'pro_max'].includes(plan)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid plan. Must be: free, pro, or pro_max (advanced maps to pro_max)' 
        },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    
    // Update user's public metadata
    await client.users.updateUser(userId, {
      publicMetadata: {
        subscriptionPlan: plan,
        subscriptionStatus: plan === 'free' ? 'inactive' : 'active',
        updatedAt: new Date().toISOString(),
      }
    });

    console.log(`✅ Updated user ${userId} to ${plan} plan`);

    return NextResponse.json({
      success: true,
      message: `Successfully updated to ${plan} plan`,
      plan,
      limit: plan === 'free' ? 100 : plan === 'pro' ? 2000 : 4000
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
