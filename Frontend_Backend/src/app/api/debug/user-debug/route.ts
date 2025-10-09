import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET() {
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

    // Get the current user with all metadata
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

    // Return all user metadata for debugging
    return NextResponse.json({
      success: true,
      debug: {
        userId: user.id,
        publicMetadata: user.publicMetadata,
        privateMetadata: user.privateMetadata,
        subscriptionPlan: user.publicMetadata?.subscriptionPlan || 'not_set',
        subscriptionStatus: user.publicMetadata?.subscriptionStatus || 'not_set',
        hasMetadata: !!user.publicMetadata && Object.keys(user.publicMetadata).length > 0
      }
    });

  } catch (error) {
    console.error('Error fetching user debug info:', error);
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