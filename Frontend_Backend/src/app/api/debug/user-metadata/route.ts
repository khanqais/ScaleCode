import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

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

    // Get all metadata
    const publicMetadata = user.publicMetadata || {};
    const privateMetadata = user.privateMetadata || {};

    console.log('🔍 Debug User Metadata:');
    console.log('User ID:', userId);
    console.log('Public Metadata:', JSON.stringify(publicMetadata, null, 2));
    console.log('Private Metadata:', JSON.stringify(privateMetadata, null, 2));

    return NextResponse.json({
      success: true,
      userId,
      publicMetadata,
      privateMetadata,
      subscriptionPlan: publicMetadata.subscriptionPlan || 'NOT SET',
      subscriptionStatus: publicMetadata.subscriptionStatus || 'NOT SET',
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
