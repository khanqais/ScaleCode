const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./DB/connect.js')
const problemRoutes = require('./routes/problemRoutes.js')
const userRoutes = require('./routes/UserRoutes.js')

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/problems', problemRoutes)
app.use('/api/users', userRoutes)



// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

const PORT = process.env.PORT || 5000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Connected to Mongo");
    app.listen(PORT, console.log(`Server is listening on ${PORT}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
