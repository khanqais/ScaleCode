import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: false,
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
    defaultConfidence: {
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
    averageConfidence: {
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


userSchema.index({ email: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;