import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized' 
        },
        { status: 401 }
      );
    }

    // Get the current user with metadata
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        },
        { status: 404 }
      );
    }

    // Get subscription plan from user's public metadata
    const subscriptionPlan = user.publicMetadata?.subscriptionPlan as string || 'free';
    const stripeCustomerId = user.publicMetadata?.stripeCustomerId as string || null;
    const subscriptionStatus = user.publicMetadata?.subscriptionStatus as string || 'inactive';

    // Return subscription information
    return NextResponse.json({
      success: true,
      subscription: {
        plan: subscriptionPlan,
        status: subscriptionStatus,
        stripeCustomerId: stripeCustomerId,
        features: getPlanFeatures(subscriptionPlan)
      }
    });

  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to get plan features
function getPlanFeatures(plan: string) {
  const features: Record<string, { problemLimit: number, features: string[] }> = {
    'free': {
      problemLimit: 50,
      features: [
        'Up to 50 problems',
        'Basic organization',
        'Revision tracking'
      ]
    },
    'pro': {
      problemLimit: 500,
      features: [
        'Up to 500 problems',
        'Advanced organization',
        'Priority support',
        'Revision tracking',
        'Custom categories'
      ]
    },
    'pro_max': {
      problemLimit: 2000,
      features: [
        'Up to 2000 problems',
        'Unlimited organization',
        'Priority support',
        'Advanced analytics',
        'Revision tracking',
        'Custom categories',
        'Export functionality'
      ]
    }
  };

  return features[plan] || features['free'];
}
