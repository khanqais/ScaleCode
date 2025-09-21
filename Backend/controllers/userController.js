const User = require('../models/User.js')
const Problem = require('../models/Problem.js')
const { clerkClient } = require('@clerk/clerk-sdk-node')

const syncUser = async (req, res) => {
  try {
    const { userId } = req.auth
    
    const clerkUser = await clerkClient.users.getUser(userId)
    
    let user = await User.findOne({ clerkId: userId })
    
    if (!user) {
      user = new User({
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        profileImage: clerkUser.imageUrl || ''
      })
      await user.save()
    } else {
      user.email = clerkUser.emailAddresses[0]?.emailAddress || user.email
      user.firstName = clerkUser.firstName || user.firstName
      user.lastName = clerkUser.lastName || user.lastName
      user.profileImage = clerkUser.imageUrl || user.profileImage
      await user.save()
    }

    res.status(200).json({
      success: true,
      message: 'User synced successfully',
      data: user
    })

  } catch (error) {
    console.error('Sync user error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to sync user',
      message: error.message
    })
  }
}

const getUserStats = async (req, res) => {
  try {
    const { userId } = req.auth

    const problems = await Problem.find({ userId })
    const totalProblems = problems.length
    
    const categories = [...new Set(problems.map(p => p.category))].length
    
    const averageDifficulty = totalProblems > 0
      ? problems.reduce((sum, p) => sum + p.difficulty, 0) / totalProblems
      : 0

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const recentActivity = problems.filter(p => p.createdAt > weekAgo).length

    const categoryStats = problems.reduce((acc, problem) => {
      acc[problem.category] = (acc[problem.category] || 0) + 1
      return acc
    }, {})

    const stats = {
      totalProblems,
      categories,
      averageDifficulty: Math.round(averageDifficulty * 10) / 10,
      recentActivity,
      categoryStats,
      difficultyStats: {
        easy: problems.filter(p => p.difficulty <= 3).length,
        medium: problems.filter(p => p.difficulty >= 4 && p.difficulty <= 7).length,
        hard: problems.filter(p => p.difficulty >= 8).length
      }
    }

    res.status(200).json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Get user stats error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user stats',
      message: error.message
    })
  }
}

module.exports = {
  syncUser,
  getUserStats
}
