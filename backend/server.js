require('dotenv').config()
const express = require('express')
const cors = require('cors')
const authRouter = require('./services/authService')
const adminRouter = require('./services/adminRouter')

const app = express()
const port = process.env.SERVER_PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/auth', authRouter)
app.use('/admin', adminRouter)

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'BadgerBoard API Server' 
  })
})

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
  console.log(`Admin routes: http://localhost:${port}/admin`)
  console.log(`Auth routes: http://localhost:${port}/auth`)
})

module.exports = app