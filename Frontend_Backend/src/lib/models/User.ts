import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false // Not required for OAuth users
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
  provider: {
    type: String, // 'credentials', 'google', 'github'
    default: 'credentials'
  },
  providerId: {
    type: String // OAuth provider's user ID
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'pro', 'pro_max'],
    default: 'free'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'active'
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
  },
  resetToken: {
    type: String
  },
  resetTokenExpiry: {
    type: Date
  },
  otp: {
    type: String
  },
  otpExpiry: {
    type: Date
  }
}, {
  timestamps: true
});

userSchema.index({ provider: 1, providerId: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;