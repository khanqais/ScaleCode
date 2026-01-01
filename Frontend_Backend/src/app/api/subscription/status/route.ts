import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized' 
        },
        { status: 401 }
      );
    }

    await connectDB();
   
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        },
        { status: 404 }
      );
    }

    
    const subscriptionPlan = user.subscriptionPlan as string || 'free';
    const subscriptionStatus = user.subscriptionStatus as string || 'active';

    
    return NextResponse.json({
      success: true,
      subscription: {
        plan: subscriptionPlan,
        status: subscriptionStatus,
        features: getPlanFeatures(subscriptionPlan)
      }
    });

  } catch (error) {
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


function getPlanFeatures(plan: string) {
  const features: Record<string, { problemLimit: number, features: string[] }> = {
    'free': {
      problemLimit: 100,
      features: [
        'Up to 100 problems',
        'Basic organization',
        'Revision tracking'
      ]
    },
    'pro': {
      problemLimit: 2000,
      features: [
        'Up to 2000 problems',
        'Advanced organization',
        'Priority support',
        'Revision tracking',
        'Custom categories'
      ]
    },
    'pro_max': {
      problemLimit: 4000,
      features: [
        'Up to 4000 problems',
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
