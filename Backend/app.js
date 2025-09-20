const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { authenticateToken } = require('./middleware/auth')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json())

// Protected route example
app.get('/api/problems', authenticateToken, (req, res) => {
  const userId = req.user.sub
  
  res.json({
    message: 'Protected route accessed successfully',
    userId: userId,
    problems: [] // Fetch from Supabase here
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
