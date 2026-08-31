import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import expenseRoutes from './routes/expenseRoutes.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/expenses', expenseRoutes)

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'PaisaWise API is running',
  })
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})