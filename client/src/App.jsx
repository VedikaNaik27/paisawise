import { useEffect, useState } from 'react'

import {
  getExpenses,
  createExpense,
  parseExpense,
  getExpenseSummary,
  getExpenseInsights,
  getBudget,
  updateBudget,
  deleteExpense,
  updateExpense,
} from './api/expenseApi'


function App() {
  // =====================================================
  // EXPENSES
  // =====================================================

  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)


  // =====================================================
  // SUMMARY
  // =====================================================

  const [summary, setSummary] = useState({
    totalSpent: 0,
    transactionCount: 0,
    byCategory: {},
  })


  // =====================================================
  // INSIGHTS
  // =====================================================

  const [insights, setInsights] = useState({
    topCategory: 'None',
    topCategoryAmount: 0,
    insights: [],
  })


  // =====================================================
  // BUDGET
  // =====================================================

  const [budgetData, setBudgetData] = useState({
    budget: 0,
    totalSpent: 0,
    remaining: 0,
    percentageUsed: 0,
  })

  const [newBudget, setNewBudget] = useState('')
  const [budgetUpdating, setBudgetUpdating] = useState(false)


  // =====================================================
  // MANUAL EXPENSE
  // =====================================================

  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [merchant, setMerchant] = useState('')
  const [note, setNote] = useState('')


  // =====================================================
  // AI EXPENSE
  // =====================================================

  const [aiText, setAiText] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)


  // =====================================================
  // EDIT EXPENSE
  // =====================================================

  const [editingExpense, setEditingExpense] = useState(null)
  const [editSaving, setEditSaving] = useState(false)


  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  const loadDashboard = async () => {
    try {
      const [
        expensesData,
        summaryData,
        insightsData,
        budgetDataResponse,
      ] = await Promise.all([
        getExpenses(),
        getExpenseSummary(),
        getExpenseInsights(),
        getBudget(),
      ])

      setExpenses(expensesData || [])

      setSummary({
        totalSpent:
          Number(summaryData?.totalSpent) || 0,

        transactionCount:
          Number(summaryData?.transactionCount) || 0,

        byCategory:
          summaryData?.byCategory || {},
      })

      setInsights({
        topCategory:
          insightsData?.topCategory || 'None',

        topCategoryAmount:
          Number(
            insightsData?.topCategoryAmount
          ) || 0,

        insights:
          insightsData?.insights || [],
      })

      setBudgetData({
        budget:
          Number(
            budgetDataResponse?.budget
          ) || 0,

        totalSpent:
          Number(
            budgetDataResponse?.totalSpent
          ) || 0,

        remaining:
          Number(
            budgetDataResponse?.remaining
          ) || 0,

        percentageUsed:
          Number(
            budgetDataResponse?.percentageUsed
          ) || 0,
      })
    } catch (error) {
      console.error(
        'Dashboard loading error:',
        error
      )
    } finally {
      setLoading(false)
    }
  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadDashboard()
  }, [])


  // =====================================================
  // CREATE MANUAL EXPENSE
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!amount || !category) {
      alert(
        'Please enter amount and category'
      )
      return
    }

    const numericAmount = Number(amount)

    if (
      isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      alert(
        'Please enter a valid positive amount'
      )
      return
    }

    try {
      await createExpense({
        amount: numericAmount,
        category,
        merchant:
          merchant.trim()
            ? merchant.trim()
            : null,
        note:
          note.trim()
            ? note.trim()
            : null,
      })

      setAmount('')
      setMerchant('')
      setNote('')
      setCategory('Food')

      await loadDashboard()
    } catch (error) {
      console.error(
        'Create expense error:',
        error
      )

      alert(
        error.message ||
        'Failed to add expense'
      )
    }
  }


  // =====================================================
  // AI PARSE
  // =====================================================

  const handleAIParse = async () => {
    if (!aiText.trim()) {
      alert(
        'Please describe your expense'
      )
      return
    }

    try {
      setAiLoading(true)

      const result =
        await parseExpense(
          aiText.trim()
        )

      setAiResult({
        amount:
          result?.amount ?? null,

        category:
          result?.category || 'Other',

        merchant:
          result?.merchant || '',

        note:
          result?.note || '',
      })
    } catch (error) {
      console.error(
        'AI parsing error:',
        error
      )

      alert(
        error.message ||
        'Failed to parse expense'
      )
    } finally {
      setAiLoading(false)
    }
  }


  // =====================================================
  // SAVE AI EXPENSE
  // =====================================================

  const handleSaveAIExpense = async () => {
    if (
      !aiResult ||
      aiResult.amount === null ||
      aiResult.amount === '' ||
      !aiResult.category
    ) {
      alert(
        'Please provide a valid amount and category'
      )
      return
    }

    const numericAmount =
      Number(aiResult.amount)

    if (
      isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      alert(
        'Please provide a valid amount'
      )
      return
    }

    try {
      await createExpense({
        amount: numericAmount,
        category: aiResult.category,
        merchant:
          aiResult.merchant?.trim()
            ? aiResult.merchant.trim()
            : null,
        note:
          aiResult.note?.trim()
            ? aiResult.note.trim()
            : null,
      })

      setAiResult(null)
      setAiText('')

      await loadDashboard()
    } catch (error) {
      console.error(
        'Save AI expense error:',
        error
      )

      alert(
        error.message ||
        'Failed to save expense'
      )
    }
  }


  // =====================================================
  // UPDATE BUDGET
  // =====================================================

  const handleUpdateBudget = async (event) => {
    event.preventDefault()

    const numericBudget =
      Number(newBudget)

    if (
      !newBudget ||
      isNaN(numericBudget) ||
      numericBudget <= 0
    ) {
      alert(
        'Please enter a valid positive budget'
      )
      return
    }

    try {
      setBudgetUpdating(true)

      await updateBudget(
        numericBudget
      )

      setNewBudget('')

      await loadDashboard()
    } catch (error) {
      console.error(
        'Update budget error:',
        error
      )

      alert(
        error.message ||
        'Failed to update budget'
      )
    } finally {
      setBudgetUpdating(false)
    }
  }


  // =====================================================
  // DELETE EXPENSE
  // =====================================================

  const handleDeleteExpense = async (id) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this expense?'
      )

    if (!confirmed) {
      return
    }

    try {
      await deleteExpense(id)

      await loadDashboard()
    } catch (error) {
      console.error(
        'Delete expense error:',
        error
      )

      alert(
        error.message ||
        'Failed to delete expense'
      )
    }
  }


  // =====================================================
  // START EDIT
  // =====================================================

  const handleEditExpense = (expense) => {
    setEditingExpense({
      id: expense.id,
      amount: expense.amount,
      category: expense.category,
      merchant:
        expense.merchant || '',
      note:
        expense.note || '',
    })
  }


  // =====================================================
  // SAVE EDIT
  // =====================================================

  const handleSaveEditedExpense = async (
    event
  ) => {
    event.preventDefault()

    if (!editingExpense) {
      return
    }

    const numericAmount =
      Number(editingExpense.amount)

    if (
      isNaN(numericAmount) ||
      numericAmount <= 0 ||
      !editingExpense.category
    ) {
      alert(
        'Please enter a valid amount and category'
      )
      return
    }

    try {
      setEditSaving(true)

      await updateExpense(
        editingExpense.id,
        {
          amount: numericAmount,

          category:
            editingExpense.category,

          merchant:
            editingExpense.merchant.trim()
              ? editingExpense.merchant.trim()
              : null,

          note:
            editingExpense.note.trim()
              ? editingExpense.note.trim()
              : null,
        }
      )

      setEditingExpense(null)

      await loadDashboard()
    } catch (error) {
      console.error(
        'Update expense error:',
        error
      )

      alert(
        error.message ||
        'Failed to update expense'
      )
    } finally {
      setEditSaving(false)
    }
  }


  // =====================================================
  // CATEGORY DATA
  // =====================================================

  const categoryEntries =
    Object.entries(
      summary.byCategory || {}
    )

  const sortedCategories =
    [...categoryEntries].sort(
      (a, b) =>
        Number(b[1]) -
        Number(a[1])
    )

  const maxCategoryAmount =
    sortedCategories.length > 0
      ? Number(
          sortedCategories[0][1]
        )
      : 0


  // =====================================================
  // BUDGET DISPLAY
  // =====================================================

  const budgetPercentage =
    Math.min(
      Math.max(
        Number(
          budgetData.percentageUsed
        ) || 0,
        0
      ),
      100
    )


  let budgetMessage =
    'You are doing well with your budget.'

  let budgetMessageClass =
    'text-green-600'


  if (
    budgetData.percentageUsed >= 90
  ) {
    budgetMessage =
      '⚠️ Your budget is almost exhausted!'

    budgetMessageClass =
      'text-red-600'
  } else if (
    budgetData.percentageUsed >= 80
  ) {
    budgetMessage =
      '⚠️ You are getting close to your monthly budget.'

    budgetMessageClass =
      'text-orange-600'
  } else if (
    budgetData.percentageUsed >= 70
  ) {
    budgetMessage =
      'Keep an eye on your spending this month.'

    budgetMessageClass =
      'text-yellow-600'
  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 p-6">

      {/* 0.92 SCALE */}
      <div className="mx-auto max-w-6xl scale-[0.92] origin-top">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-8 text-center">

          <h1 className="text-5xl font-bold text-purple-700">
            PaisaWise 💰
          </h1>

          <p className="mt-2 text-lg text-gray-600">
            Your smart student expense tracker
          </p>

        </header>


        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="mb-8 grid gap-6 md:grid-cols-3">

          <div className="rounded-3xl bg-gradient-to-r from-purple-600 to-purple-500 p-8 text-white shadow-xl">

            <p className="text-lg font-semibold">
              💰 Total Spent
            </p>

            <p className="mt-4 text-5xl font-bold">
              ₹{summary.totalSpent}
            </p>

            <p className="mt-4">
              Across all expenses
            </p>

          </div>


          <div className="rounded-3xl bg-gradient-to-r from-pink-600 to-pink-500 p-8 text-white shadow-xl">

            <p className="text-lg font-semibold">
              🧾 Transactions
            </p>

            <p className="mt-4 text-5xl font-bold">
              {summary.transactionCount}
            </p>

            <p className="mt-4">
              Expenses recorded
            </p>

          </div>


          <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white shadow-xl">

            <p className="text-lg font-semibold">
              🏆 Top Category
            </p>

            <p className="mt-4 text-4xl font-bold">
              {insights.topCategory}
            </p>

            <p className="mt-4">
              Highest spending category
            </p>

          </div>

        </div>


        {/* =================================================
            SPENDING OVERVIEW
        ================================================= */}

        <section className="mb-8 rounded-3xl bg-white p-8 shadow-xl">

          <h2 className="text-3xl font-bold text-gray-800">
            📊 Spending Overview
          </h2>

          <p className="mt-2 text-gray-500">
            A quick look at your spending habits
          </p>


          <div className="mt-8 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl bg-purple-50 p-7">

              <p className="text-gray-500">
                Total Spent
              </p>

              <p className="mt-3 text-4xl font-bold text-purple-700">
                ₹{summary.totalSpent}
              </p>

            </div>


            <div className="rounded-2xl bg-pink-50 p-7">

              <p className="text-gray-500">
                Transactions
              </p>

              <p className="mt-3 text-4xl font-bold text-pink-600">
                {summary.transactionCount}
              </p>

            </div>


            <div className="rounded-2xl bg-orange-50 p-7">

              <p className="text-gray-500">
                Categories Used
              </p>

              <p className="mt-3 text-4xl font-bold text-orange-600">
                {categoryEntries.length}
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            MONTHLY BUDGET
        ================================================= */}

        <section className="mb-8 rounded-3xl bg-white p-8 shadow-xl">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-3xl font-bold text-gray-800">
                💰 Monthly Budget
              </h2>

              <p className="mt-2 text-gray-500">
                Track your spending against your monthly limit
              </p>

            </div>


            <div className="text-right">

              <p className="text-sm text-gray-500">
                Budget
              </p>

              <p className="text-3xl font-bold text-purple-700">
                ₹{budgetData.budget}
              </p>

            </div>

          </div>


          <div className="mt-8 grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl bg-purple-50 p-6">

              <p className="text-gray-500">
                Budget
              </p>

              <p className="mt-2 text-3xl font-bold text-purple-700">
                ₹{budgetData.budget}
              </p>

            </div>


            <div className="rounded-2xl bg-pink-50 p-6">

              <p className="text-gray-500">
                Spent
              </p>

              <p className="mt-2 text-3xl font-bold text-pink-600">
                ₹{budgetData.totalSpent}
              </p>

            </div>


            <div className="rounded-2xl bg-green-50 p-6">

              <p className="text-gray-500">
                Remaining
              </p>

              <p
                className={`mt-2 text-3xl font-bold ${
                  budgetData.remaining < 0
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                ₹{budgetData.remaining}
              </p>

            </div>

          </div>


          {/* PROGRESS */}

          <div className="mt-8">

            <div className="mb-2 flex justify-between">

              <span className="font-semibold text-gray-700">
                Budget used
              </span>

              <span className="font-bold text-purple-700">
                {budgetData.percentageUsed}%
              </span>

            </div>


            <div className="h-5 w-full overflow-hidden rounded-full bg-gray-200">

              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{
                  width: `${budgetPercentage}%`,
                }}
              />

            </div>


            <p
              className={`mt-3 font-semibold ${budgetMessageClass}`}
            >
              {budgetMessage}
            </p>

          </div>


          {/* UPDATE BUDGET */}

          <div className="mt-8 border-t border-gray-200 pt-7">

            <h3 className="text-xl font-bold text-gray-800">
              ✏️ Change Monthly Budget
            </h3>

            <p className="mt-1 text-gray-500">
              Set a new spending limit for yourself.
            </p>


            <form
              onSubmit={handleUpdateBudget}
              className="mt-5 flex flex-col gap-3 sm:flex-row"
            >

              <input
                type="number"
                min="1"
                step="1"
                placeholder={`Current budget: ₹${budgetData.budget}`}
                value={newBudget}
                onChange={(event) =>
                  setNewBudget(
                    event.target.value
                  )
                }
                className="flex-1 rounded-xl border border-gray-300 p-4 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              />


              <button
                type="submit"
                disabled={budgetUpdating}
                className="rounded-xl bg-purple-600 px-7 py-4 font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {budgetUpdating
                  ? 'Updating...'
                  : 'Update Budget'}
              </button>

            </form>

          </div>

        </section>


        {/* =================================================
            SPENDING BY CATEGORY
        ================================================= */}

        <section className="mb-8 rounded-3xl bg-white p-8 shadow-xl">

          <h2 className="text-3xl font-bold text-gray-800">
            📊 Spending by Category
          </h2>

          <p className="mt-2 text-gray-500">
            See where your money is going
          </p>


          {sortedCategories.length === 0 ? (

            <p className="mt-8 text-gray-500">
              No spending data yet.
            </p>

          ) : (

            <div className="mt-8 space-y-7">

              {sortedCategories.map(
                ([categoryName, categoryAmount]) => {

                  const numericAmount =
                    Number(categoryAmount)

                  const percentage =
                    summary.totalSpent > 0
                      ? (
                          (numericAmount /
                            summary.totalSpent) *
                          100
                        ).toFixed(1)
                      : '0.0'

                  const barWidth =
                    maxCategoryAmount > 0
                      ? (
                          (numericAmount /
                            maxCategoryAmount) *
                          100
                        )
                      : 0

                  return (

                    <div key={categoryName}>

                      <div className="flex items-center justify-between">

                        <span className="font-semibold text-gray-800">
                          {categoryName}
                        </span>

                        <span className="font-bold text-gray-800">
                          ₹{numericAmount}
                        </span>

                      </div>


                      <div className="mt-3 h-5 overflow-hidden rounded-full bg-gray-100">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{
                            width: `${barWidth}%`,
                          }}
                        />

                      </div>


                      <p className="mt-2 text-right text-sm text-gray-500">
                        {percentage}%
                      </p>

                    </div>

                  )
                }
              )}

            </div>

          )}

        </section>


        {/* =================================================
            AI EXPENSE
        ================================================= */}

        <section className="mb-8 rounded-3xl bg-white p-8 shadow-xl">

          <h2 className="text-3xl font-bold text-gray-800">
            ✨ Add with AI
          </h2>

          <p className="mt-2 text-gray-500">
            Just describe your expense naturally
          </p>


          <div className="mt-6 flex flex-col gap-4 md:flex-row">

            <input
              type="text"
              placeholder="e.g. 250 zomato dinner with friends"
              value={aiText}
              onChange={(event) =>
                setAiText(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter'
                ) {
                  handleAIParse()
                }
              }}
              className="flex-1 rounded-xl border border-gray-300 p-5 outline-none focus:border-purple-500"
            />


            <button
              type="button"
              onClick={handleAIParse}
              disabled={aiLoading}
              className="rounded-xl bg-purple-600 px-8 py-4 font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {aiLoading
                ? 'Parsing...'
                : '✨ Parse'}
            </button>

          </div>


          {aiResult && (

            <div className="mt-8 rounded-3xl bg-purple-50 p-7">

              <h3 className="text-2xl font-bold text-purple-700">
                AI Result — Review Before Saving
              </h3>


              <div className="mt-6 space-y-4">

                <div>

                  <label className="font-semibold text-gray-700">
                    Amount
                  </label>

                  <input
                    type="number"
                    value={
                      aiResult.amount ?? ''
                    }
                    onChange={(event) =>
                      setAiResult({
                        ...aiResult,
                        amount:
                          event.target.value === ''
                            ? null
                            : Number(
                                event.target.value
                              ),
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-purple-500"
                  />

                </div>


                <div>

                  <label className="font-semibold text-gray-700">
                    Category
                  </label>

                  <select
                    value={
                      aiResult.category ||
                      'Other'
                    }
                    onChange={(event) =>
                      setAiResult({
                        ...aiResult,
                        category:
                          event.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-purple-500"
                  >
                    <option>Food</option>
                    <option>Travel</option>
                    <option>Education</option>
                    <option>Entertainment</option>
                    <option>Shopping</option>
                    <option>Bills</option>
                    <option>Other</option>
                  </select>

                </div>


                <div>

                  <label className="font-semibold text-gray-700">
                    Merchant
                  </label>

                  <input
                    type="text"
                    value={
                      aiResult.merchant || ''
                    }
                    placeholder="e.g. Zomato"
                    onChange={(event) =>
                      setAiResult({
                        ...aiResult,
                        merchant:
                          event.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-purple-500"
                  />

                </div>


                <div>

                  <label className="font-semibold text-gray-700">
                    Note
                  </label>

                  <input
                    type="text"
                    value={
                      aiResult.note || ''
                    }
                    placeholder="e.g. dinner with friends"
                    onChange={(event) =>
                      setAiResult({
                        ...aiResult,
                        note:
                          event.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-purple-500"
                  />

                </div>


                <button
                  type="button"
                  onClick={
                    handleSaveAIExpense
                  }
                  className="w-full rounded-xl bg-green-600 p-4 font-bold text-white transition hover:bg-green-700"
                >
                  ✅ Confirm & Save Expense
                </button>

              </div>

            </div>

          )}

        </section>


        {/* =================================================
            MANUAL EXPENSE
        ================================================= */}

        <section className="mb-8 rounded-3xl bg-white p-8 shadow-xl">

          <h2 className="text-3xl font-bold text-gray-800">
            ➕ Add Expense Manually
          </h2>


          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-4"
          >

            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount (₹)"
              value={amount}
              onChange={(event) =>
                setAmount(
                  event.target.value
                )
              }
              className="rounded-xl border border-gray-300 p-4 outline-none focus:border-purple-500"
            />


            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              className="rounded-xl border border-gray-300 p-4 outline-none focus:border-purple-500"
            >
              <option>Food</option>
              <option>Travel</option>
              <option>Education</option>
              <option>Entertainment</option>
              <option>Shopping</option>
              <option>Bills</option>
              <option>Other</option>
            </select>


            <input
              type="text"
              placeholder="Merchant (e.g. Zomato)"
              value={merchant}
              onChange={(event) =>
                setMerchant(
                  event.target.value
                )
              }
              className="rounded-xl border border-gray-300 p-4 outline-none focus:border-purple-500"
            />


            <input
              type="text"
              placeholder="Note (e.g. dinner with friends)"
              value={note}
              onChange={(event) =>
                setNote(
                  event.target.value
                )
              }
              className="rounded-xl border border-gray-300 p-4 outline-none focus:border-purple-500"
            />


            <button
              type="submit"
              className="rounded-xl bg-purple-600 p-4 font-bold text-white transition hover:bg-purple-700"
            >
              + Add Expense
            </button>

          </form>

        </section>


        {/* =================================================
            RECENT EXPENSES
        ================================================= */}

        <section className="mb-8 rounded-3xl bg-white p-8 shadow-xl">

          <h2 className="text-3xl font-bold text-gray-800">
            🧾 Recent Expenses
          </h2>


          {loading ? (

            <p className="mt-6 text-gray-500">
              Loading expenses...
            </p>

          ) : expenses.length === 0 ? (

            <p className="mt-6 text-gray-500">
              No expenses yet.
            </p>

          ) : (

            <div className="mt-6 space-y-4">

              {expenses.map(
                (expense) => (

                  <div
                    key={expense.id}
                    className="flex flex-col gap-4 rounded-2xl bg-purple-50 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div>

                      <h3 className="font-bold text-gray-800">
                        {expense.merchant ||
                          expense.category}
                      </h3>

                      <p className="text-gray-500">
                        {expense.note ||
                          'No note'}
                      </p>

                      <span className="text-sm font-medium text-purple-600">
                        {expense.category}
                      </span>

                    </div>


                    <div className="flex flex-wrap items-center gap-3">

                      <div className="text-xl font-bold text-gray-800">
                        ₹{expense.amount}
                      </div>


                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          handleEditExpense(
                            expense
                          )
                        }
                        className="rounded-xl bg-blue-100 px-4 py-2 font-semibold text-blue-600 transition hover:bg-blue-200"
                      >
                        ✏️ Edit
                      </button>


                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteExpense(
                            expense.id
                          )
                        }
                        className="rounded-xl bg-red-100 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-200"
                      >
                        🗑 Delete
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}


          {/* =================================================
              EDIT FORM
          ================================================= */}

          {editingExpense && (

            <div className="mt-8 rounded-3xl bg-blue-50 p-7">

              <div className="flex items-center justify-between">

                <h3 className="text-2xl font-bold text-blue-700">
                  ✏️ Edit Expense
                </h3>


                <button
                  type="button"
                  onClick={() =>
                    setEditingExpense(null)
                  }
                  className="rounded-lg px-3 py-2 text-gray-500 hover:bg-white"
                >
                  ✕
                </button>

              </div>


              <form
                onSubmit={
                  handleSaveEditedExpense
                }
                className="mt-6 grid gap-4"
              >

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Amount (₹)"
                  value={
                    editingExpense.amount
                  }
                  onChange={(event) =>
                    setEditingExpense({
                      ...editingExpense,
                      amount:
                        event.target.value,
                    })
                  }
                  className="rounded-xl border border-gray-300 p-4 outline-none focus:border-blue-500"
                />


                <select
                  value={
                    editingExpense.category
                  }
                  onChange={(event) =>
                    setEditingExpense({
                      ...editingExpense,
                      category:
                        event.target.value,
                    })
                  }
                  className="rounded-xl border border-gray-300 p-4 outline-none focus:border-blue-500"
                >
                  <option>Food</option>
                  <option>Travel</option>
                  <option>Education</option>
                  <option>Entertainment</option>
                  <option>Shopping</option>
                  <option>Bills</option>
                  <option>Other</option>
                </select>


                <input
                  type="text"
                  placeholder="Merchant"
                  value={
                    editingExpense.merchant
                  }
                  onChange={(event) =>
                    setEditingExpense({
                      ...editingExpense,
                      merchant:
                        event.target.value,
                    })
                  }
                  className="rounded-xl border border-gray-300 p-4 outline-none focus:border-blue-500"
                />


                <input
                  type="text"
                  placeholder="Note"
                  value={
                    editingExpense.note
                  }
                  onChange={(event) =>
                    setEditingExpense({
                      ...editingExpense,
                      note:
                        event.target.value,
                    })
                  }
                  className="rounded-xl border border-gray-300 p-4 outline-none focus:border-blue-500"
                />


                <div className="flex flex-col gap-3 sm:flex-row">

                  <button
                    type="submit"
                    disabled={editSaving}
                    className="flex-1 rounded-xl bg-blue-600 p-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {editSaving
                      ? 'Saving...'
                      : '💾 Save Changes'}
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setEditingExpense(null)
                    }
                    className="rounded-xl bg-gray-200 px-6 py-4 font-bold text-gray-700 transition hover:bg-gray-300"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            </div>

          )}

        </section>


        {/* =================================================
            INSIGHTS
        ================================================= */}

        <section className="mb-8 rounded-3xl bg-white p-8 shadow-xl">

          <h2 className="text-3xl font-bold text-gray-800">
            💡 Spending Insights
          </h2>

          <p className="mt-2 text-gray-500">
            Understand your spending habits
          </p>


          {insights.insights.length === 0 ? (

            <p className="mt-6 text-gray-500">
              No insights available yet.
            </p>

          ) : (

            <div className="mt-6 space-y-4">

              {insights.insights.map(
                (insight, index) => (

                  <div
                    key={index}
                    className="rounded-2xl bg-purple-50 p-5 text-gray-700"
                  >
                    💡 {insight}
                  </div>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </div>
  )
}


export default App