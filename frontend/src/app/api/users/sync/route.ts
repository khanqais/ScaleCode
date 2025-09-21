import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

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

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    
    // Check if user exists in database
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      // Create new user
      user = new User({
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        profileImage: clerkUser.imageUrl || ''
      });
      await user.save();
    } else {
      // Update existing user info
      user.email = clerkUser.emailAddresses[0]?.emailAddress || user.email;
      user.firstName = clerkUser.firstName || user.firstName;
      user.lastName = clerkUser.lastName || user.lastName;
      user.profileImage = clerkUser.imageUrl || user.profileImage;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'User synced successfully',
      data: user
    });

  } catch (error: any) {
    console.error('Sync user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to sync user',
      message: error.message
    }, { status: 500 });
  }
}