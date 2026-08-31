import express from 'express'

import {
  getExpenses,
  createExpense,
  parseExpenseWithAI,
  getExpenseSummary,
  getExpenseInsights,
  getBudget,
  updateBudget,
  deleteExpense,
  updateExpense,
} from '../controllers/expenseController.js'

const router = express.Router()


// GET all expenses
router.get('/', getExpenses)


// Create expense
router.post('/', createExpense)


// AI expense parsing
router.post('/parse', parseExpenseWithAI)


// Spending summary
router.get('/summary', getExpenseSummary)


// Spending insights
router.get('/insights', getExpenseInsights)


// Get monthly budget
router.get('/budget', getBudget)


// Update monthly budget
router.put('/budget', updateBudget)

// Update expense
router.put('/:id', updateExpense)

// Delete expense
router.delete('/:id', deleteExpense)


export default router