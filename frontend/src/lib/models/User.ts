import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String
  },
  preferences: {
    defaultDifficulty: {
      type: Number,
      default: 5
    },
    preferredCategories: [{
      type: String
    }]
  },
  stats: {
    totalProblems: {
      type: Number,
      default: 0
    },
    averageDifficulty: {
      type: Number,
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexing for performance
userSchema.index({ clerkId: 1 });
userSchema.index({ email: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;