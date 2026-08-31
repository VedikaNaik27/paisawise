const API_URL = 'http://localhost:5000/api/expenses'


// =====================================================
// GET ALL EXPENSES
// =====================================================

export const getExpenses = async () => {
  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error('Failed to fetch expenses')
  }

  return response.json()
}


// =====================================================
// CREATE EXPENSE
// =====================================================

export const createExpense = async (expense) => {
  const response = await fetch(API_URL, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(expense),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    throw new Error(
      errorData.error || 'Failed to create expense'
    )
  }

  return response.json()
}


// =====================================================
// AI PARSE EXPENSE
// =====================================================

export const parseExpense = async (text) => {
  const response = await fetch(
    `${API_URL}/parse`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        text,
      }),
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    throw new Error(
      errorData.error || 'Failed to parse expense'
    )
  }

  return response.json()
}


// =====================================================
// GET EXPENSE SUMMARY
// =====================================================

export const getExpenseSummary = async () => {
  const response = await fetch(
    `${API_URL}/summary`
  )

  if (!response.ok) {
    throw new Error(
      'Failed to fetch expense summary'
    )
  }

  return response.json()
}


// =====================================================
// GET EXPENSE INSIGHTS
// =====================================================

export const getExpenseInsights = async () => {
  const response = await fetch(
    `${API_URL}/insights`
  )

  if (!response.ok) {
    throw new Error(
      'Failed to fetch expense insights'
    )
  }

  return response.json()
}


// =====================================================
// GET MONTHLY BUDGET
// =====================================================

export const getBudget = async () => {
  const response = await fetch(
    `${API_URL}/budget`
  )

  if (!response.ok) {
    throw new Error(
      'Failed to fetch budget'
    )
  }

  return response.json()
}


// =====================================================
// UPDATE MONTHLY BUDGET
// =====================================================

export const updateBudget = async (amount) => {
  const response = await fetch(
    `${API_URL}/budget`,
    {
      method: 'PUT',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        amount,
      }),
    }
  )

  if (!response.ok) {
    const errorData =
      await response.json().catch(() => ({}))

    throw new Error(
      errorData.error ||
      'Failed to update budget'
    )
  }

  return response.json()
}

// =====================================================
// DELETE EXPENSE
// =====================================================

export const deleteExpense = async (id) => {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      method: 'DELETE',
    }
  )

  if (!response.ok) {
    const errorData =
      await response.json().catch(() => ({}))

    throw new Error(
      errorData.error ||
      'Failed to delete expense'
    )
  }

  return response.json()
}

// =====================================================
// UPDATE EXPENSE
// =====================================================

export const updateExpense = async (id, expense) => {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    }
  )

  if (!response.ok) {
    const errorData =
      await response.json().catch(() => ({}))

    throw new Error(
      errorData.error ||
      'Failed to update expense'
    )
  }

  return response.json()
}