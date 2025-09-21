const Problem = require('../models/Problem.js')
const User = require('../models/User.js')

// @desc    Create new problem
// @route   POST /api/problems
// @access  Private
const createProblem = async (req, res) => {
  try {
    const { userId } = req.auth
    const {
      title,
      problemStatement,
      myCode,
      intuition,
      difficulty,
      category,
      
    } = req.body

    console.log('Creating problem for user:', userId)
    console.log('Request body:', { title, problemStatement: problemStatement?.substring(0, 50) + '...', difficulty, category })

    // Validation
    if (!title || !problemStatement || !myCode || !difficulty || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['title', 'problemStatement', 'myCode', 'difficulty', 'category']
      })
    }

    // Ensure user exists in database before creating problem
    await ensureUserExists(userId)

    // Create problem
    const problem = new Problem({
      userId,
      title: title.trim(),
      problemStatement: problemStatement.trim(),
      myCode: myCode.trim(),
      intuition: intuition?.trim() || '',
      difficulty: parseInt(difficulty),
      category,
    })

    console.log('Attempting to save problem...')
    const savedProblem = await problem.save()
    console.log('Problem saved successfully:', savedProblem._id)

    // Update user stats
    await updateUserStats(userId)

    res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      data: savedProblem
    })

  } catch (error) {
    console.error('Create problem error:', error)
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: error.message,
        details: error.errors
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create problem',
      message: error.message
    })
  }
}

// @desc    Get user's problems
// @route   GET /api/problems
// @access  Private
const getProblems = async (req, res) => {
  try {
    const { userId } = req.auth
    const { 
      page = 1, 
      limit = 10, 
      category, 
      difficulty, 
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query

    // Build filter query
    const filter = { userId }
    if (category) filter.category = category
    if (difficulty) filter.difficulty = parseInt(difficulty)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = order === 'desc' ? -1 : 1

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const problems = await Problem.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-myCode') // Exclude code for list view

    const total = await Problem.countDocuments(filter)

    res.status(200).json({
      success: true,
      data: {
        problems,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalProblems: total,
          hasNext: skip + problems.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    })

  } catch (error) {
    console.error('Get problems error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch problems',
      message: error.message
    })
  }
}

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Private
const getProblem = async (req, res) => {
  try {
    const { userId } = req.auth
    const { id } = req.params

    const problem = await Problem.findOne({ _id: id, userId })

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      })
    }

    res.status(200).json({
      success: true,
      data: problem
    })

  } catch (error) {
    console.error('Get problem error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch problem',
      message: error.message
    })
  }
}

// @desc    Update problem
// @route   PUT /api/problems/:id
// @access  Private
const updateProblem = async (req, res) => {
  try {
    const { userId } = req.auth
    const { id } = req.params

    const problem = await Problem.findOneAndUpdate(
      { _id: id, userId },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Problem updated successfully',
      data: problem
    })

  } catch (error) {
    console.error('Update problem error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update problem',
      message: error.message
    })
  }
}

// @desc    Delete problem
// @route   DELETE /api/problems/:id
// @access  Private
const deleteProblem = async (req, res) => {
  try {
    const { userId } = req.auth
    const { id } = req.params

    const problem = await Problem.findOneAndDelete({ _id: id, userId })

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      })
    }

    // Update user stats
    await updateUserStats(userId)

    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully'
    })

  } catch (error) {
    console.error('Delete problem error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete problem',
      message: error.message
    })
  }
}

// Helper function to ensure user exists in database
const ensureUserExists = async (userId) => {
  try {
    let user = await User.findOne({ clerkId: userId })
    
    if (!user) {
      // Create a basic user record if it doesn't exist
      user = new User({
        clerkId: userId,
        email: '', // Will be updated when user syncs
        firstName: '',
        lastName: '',
        stats: {
          totalProblems: 0,
          averageDifficulty: 0,
          streakDays: 0,
          lastActive: new Date()
        }
      })
      await user.save()
      console.log('Created new user record for:', userId)
    }
    
    return user
  } catch (error) {
    console.error('Ensure user exists error:', error)
    throw error
  }
}

// Helper function to update user stats
const updateUserStats = async (userId) => {
  try {
    const problems = await Problem.find({ userId })
    const totalProblems = problems.length
    const averageDifficulty = totalProblems > 0
      ? problems.reduce((sum, p) => sum + p.difficulty, 0) / totalProblems
      : 0

    // Ensure user exists first
    await ensureUserExists(userId)

    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        'stats.totalProblems': totalProblems,
        'stats.averageDifficulty': Math.round(averageDifficulty * 10) / 10,
        'stats.lastActive': new Date()
      }
    )
    
    console.log(`Updated stats for user ${userId}: ${totalProblems} problems, avg difficulty ${averageDifficulty}`)
  } catch (error) {
    console.error('Update user stats error:', error)
  }
}

module.exports = {
  createProblem,
  getProblems,
  getProblem,
  updateProblem,
  deleteProblem
}
