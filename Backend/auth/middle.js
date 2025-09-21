const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node')

// Initialize Clerk middleware with proper configuration
const requireAuth = ClerkExpressRequireAuth({
  // This will use CLERK_SECRET_KEY from environment variables
})

// Custom auth middleware with better error handling
const authenticateUser = (req, res, next) => {
  requireAuth(req, res, (err) => {
    if (err) {
      console.error('Authentication error:', err)
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please sign in to access this resource'
      })
    }
    next()
  })
}

module.exports = {
  requireAuth,
  authenticateUser
}
