import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      // If user exists and already has a password, reject
      if (existingUser.password) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists. Please sign in or use "Forgot Password".' },
          { status: 409 }
        )
      }
      
      // If user exists from OAuth but no password, allow setting one
      const hashedPassword = await bcrypt.hash(password, 12)
      existingUser.password = hashedPassword
      existingUser.provider = 'credentials' // or keep the OAuth provider
      await existingUser.save()
      
      return NextResponse.json({
        success: true,
        message: 'Password added to your account successfully',
        user: {
          id: existingUser._id.toString(),
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName
        }
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: firstName || '',
      lastName: lastName || '',
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
      stats: {
        totalProblems: 0,
        averageConfidence: 0,
        streakDays: 0,
        lastActive: new Date()
      }
    })

    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create account',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
