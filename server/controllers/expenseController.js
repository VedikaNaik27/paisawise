import prisma from '../prisma/client/client.js'
import { parseExpense } from '../services/aiParser.js'


// =====================================================
// GET /api/expenses
// Get all expenses
// =====================================================
export const getExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        date: 'desc',
      },
    })

    res.json(expenses)
  } catch (error) {
    console.error('Fetch expenses error:', error)

    res.status(500).json({
      error: 'Failed to fetch expenses',
    })
  }
}


// =====================================================
// POST /api/expenses
// Create a manual expense
// =====================================================
export const createExpense = async (req, res) => {
  try {
    const {
      amount,
      category,
      merchant,
      note,
    } = req.body

    // Validate amount and category
    if (
      amount === undefined ||
      amount === null ||
      !category
    ) {
      return res.status(400).json({
        error: 'Amount and category are required',
      })
    }

    const numericAmount = parseFloat(amount)

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        error: 'Amount must be a valid positive number',
      })
    }

    const newExpense = await prisma.expense.create({
      data: {
        amount: numericAmount,
        category,
        merchant: merchant || null,
        note: note || null,
      },
    })

    res.status(201).json(newExpense)
  } catch (error) {
    console.error('Create expense error:', error)

    res.status(500).json({
      error: 'Failed to create expense',
    })
  }
}


// =====================================================
// POST /api/expenses/parse
// Parse expense using AI
// =====================================================
export const parseExpenseWithAI = async (req, res) => {
  try {
    const { text } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: 'Expense text is required',
      })
    }

    const parsedExpense = await parseExpense(text.trim())

    res.json(parsedExpense)
  } catch (error) {
    console.error('AI parsing error:', error)

    res.status(500).json({
      error: 'Failed to parse expense',
    })
  }
}


// =====================================================
// GET /api/expenses/summary
// Get spending summary
// =====================================================
export const getExpenseSummary = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany()

    const totalSpent = expenses.reduce(
      (total, expense) =>
        total + Number(expense.amount),
      0
    )

    const transactionCount = expenses.length

    const byCategory = {}

    expenses.forEach((expense) => {
      const category = expense.category

      if (!byCategory[category]) {
        byCategory[category] = 0
      }

      byCategory[category] += Number(expense.amount)
    })

    res.json({
      totalSpent,
      transactionCount,
      byCategory,
    })
  } catch (error) {
    console.error('Summary error:', error)

    res.status(500).json({
      error: 'Failed to generate expense summary',
    })
  }
}


// =====================================================
// GET /api/expenses/insights
// Generate spending insights
// =====================================================
export const getExpenseInsights = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        date: 'desc',
      },
    })

    // No expenses
    if (expenses.length === 0) {
      return res.json({
        totalSpent: 0,
        transactionCount: 0,
        topCategory: 'None',
        topCategoryAmount: 0,
        insights: [
          'No expenses available yet.',
        ],
      })
    }

    const totalSpent = expenses.reduce(
      (total, expense) =>
        total + Number(expense.amount),
      0
    )

    const byCategory = {}

    expenses.forEach((expense) => {
      const category = expense.category

      if (!byCategory[category]) {
        byCategory[category] = 0
      }

      byCategory[category] += Number(expense.amount)
    })

    // Find highest spending category
    const sortedCategories = Object.entries(
      byCategory
    ).sort((a, b) => b[1] - a[1])

    const topCategory = sortedCategories[0]

    const topCategoryName = topCategory
      ? topCategory[0]
      : 'None'

    const topCategoryAmount = topCategory
      ? topCategory[1]
      : 0

    const topCategoryPercentage =
      totalSpent > 0
        ? (
            (topCategoryAmount / totalSpent) *
            100
          ).toFixed(1)
        : '0.0'

    const insights = [
      `Your highest spending category is ${topCategoryName} at ₹${topCategoryAmount}.`,

      `${topCategoryName} accounts for ${topCategoryPercentage}% of your total spending.`,

      `You have recorded ${expenses.length} transactions totaling ₹${totalSpent}.`,
    ]

    res.json({
      totalSpent,
      transactionCount: expenses.length,
      topCategory: topCategoryName,
      topCategoryAmount,
      insights,
    })
  } catch (error) {
    console.error('Insights error:', error)

    res.status(500).json({
      error: 'Failed to generate spending insights',
    })
  }
}


// =====================================================
// GET /api/expenses/budget
// Get monthly budget information
// =====================================================
// =====================================================
// GET /api/expenses/budget
// Get current monthly budget
// =====================================================
export const getBudget = async (req, res) => {
  try {
    let budgetRecord = await prisma.budget.findFirst()

    // Create default budget if none exists
    if (!budgetRecord) {
      budgetRecord = await prisma.budget.create({
        data: {
          amount: 6700,
        },
      })
    }

    const expenses = await prisma.expense.findMany()

    const totalSpent = expenses.reduce(
      (total, expense) =>
        total + Number(expense.amount),
      0
    )

    const budget = Number(budgetRecord.amount)

    const remaining = budget - totalSpent

    const percentageUsed =
      budget > 0
        ? (totalSpent / budget) * 100
        : 0

    res.json({
      budget,
      totalSpent,
      remaining,
      percentageUsed: Number(
        percentageUsed.toFixed(1)
      ),
    })
  } catch (error) {
    console.error('Budget error:', error)

    res.status(500).json({
      error: 'Failed to calculate budget',
    })
  }
}


// =====================================================
// PUT /api/expenses/budget
// Update monthly budget
// =====================================================
export const updateBudget = async (req, res) => {
  try {
    const { amount } = req.body

    const numericAmount = Number(amount)

    if (
      !amount ||
      isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        error: 'Budget must be a valid positive number',
      })
    }

    let budgetRecord = await prisma.budget.findFirst()

    if (budgetRecord) {
      budgetRecord = await prisma.budget.update({
        where: {
          id: budgetRecord.id,
        },
        data: {
          amount: numericAmount,
        },
      })
    } else {
      budgetRecord = await prisma.budget.create({
        data: {
          amount: numericAmount,
        },
      })
    }

    res.json({
      message: 'Budget updated successfully',
      budget: Number(budgetRecord.amount),
    })
  } catch (error) {
    console.error('Update budget error:', error)

    res.status(500).json({
      error: 'Failed to update budget',
    })
  }
}

// =====================================================
// DELETE /api/expenses/:id
// Delete an expense
// =====================================================

export const deleteExpense = async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: 'Invalid expense ID',
      })
    }

    const expense = await prisma.expense.findUnique({
      where: {
        id,
      },
    })

    if (!expense) {
      return res.status(404).json({
        error: 'Expense not found',
      })
    }

    await prisma.expense.delete({
      where: {
        id,
      },
    })

    res.json({
      message: 'Expense deleted successfully',
    })
  } catch (error) {
    console.error('Delete expense error:', error)

    res.status(500).json({
      error: 'Failed to delete expense',
    })
  }
}


// =====================================================
// PUT /api/expenses/:id
// Update an existing expense
// =====================================================

export const updateExpense = async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: 'Invalid expense ID',
      })
    }

    const {
      amount,
      category,
      merchant,
      note,
    } = req.body

    // Validate required fields
    if (
      amount === undefined ||
      amount === null ||
      !category
    ) {
      return res.status(400).json({
        error: 'Amount and category are required',
      })
    }

    const numericAmount = Number(amount)

    if (
      isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        error: 'Amount must be a valid positive number',
      })
    }

    // Check whether expense exists
    const existingExpense =
      await prisma.expense.findUnique({
        where: {
          id,
        },
      })

    if (!existingExpense) {
      return res.status(404).json({
        error: 'Expense not found',
      })
    }

    // Update expense
    const updatedExpense =
      await prisma.expense.update({
        where: {
          id,
        },
        data: {
          amount: numericAmount,
          category,
          merchant:
            merchant?.trim()
              ? merchant.trim()
              : null,
          note:
            note?.trim()
              ? note.trim()
              : null,
        },
      })

    res.json(updatedExpense)

  } catch (error) {
    console.error(
      'Update expense error:',
      error
    )

    res.status(500).json({
      error: 'Failed to update expense',
    })
  }
}