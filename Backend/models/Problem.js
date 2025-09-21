const mongoose = require('mongoose')

const problemSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  problemStatement: {
    type: String,
    required: [true, 'Problem statement is required'],
    trim: true
  },
  myCode: {
    type: String,
    required: [true, 'Solution code is required'],
    trim: true
  },
  intuition: {
    type: String,
    trim: true,
    default: ''
  },
  difficulty: {
    type: Number,
    required: [true, 'Difficulty level is required'],
    min: [1, 'Difficulty must be at least 1'],
    max: [10, 'Difficulty cannot exceed 10']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Graph', 'Array', 'Dynamic Programming', 'Tree', 'Two Pointer', 'String', 'Binary Search'],
      message: 'Invalid category'
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Index for better query performance
problemSchema.index({ userId: 1, createdAt: -1 })
problemSchema.index({ category: 1 })
problemSchema.index({ difficulty: 1 })

module.exports = mongoose.model('Problem', problemSchema)
