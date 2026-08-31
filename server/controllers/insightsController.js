import prisma from '../prisma/client/client.js'

// GET /api/expenses/insights
export const getInsights = async (req, res) => {
  try {
    // Get all expenses
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
        byCategory: {},
      })
    }

    // Calculate total spending
    const totalSpent = expenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0
    )

    // Calculate spending by category
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
      transactionCount: expenses.length,
      byCategory,
    })
  } catch (error) {
    console.error('Insights error:', error)

    res.status(500).json({
      error: 'Failed to generate insights',
    })
  }
}