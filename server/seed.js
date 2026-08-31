import prisma from './prisma/client/client.js'

async function main() {
  console.log('Starting PaisaWise database seed...')

  // Clear existing production data
  await prisma.expense.deleteMany()
  await prisma.budget.deleteMany()

  // Existing PaisaWise expenses
  const expenses = [
    {
      amount: 300,
      category: 'Food',
      merchant: 'Swiggy',
      note: 'brunch',
      date: new Date('2026-08-26T08:19:01.105Z'),
      createdAt: new Date('2026-08-26T08:19:01.105Z'),
    },
    {
      amount: 1200,
      category: 'Shopping',
      merchant: 'trends',
      note: 'myself',
      date: new Date('2026-08-26T08:17:59.475Z'),
      createdAt: new Date('2026-08-26T08:17:59.475Z'),
    },
    {
      amount: 1200,
      category: 'Education',
      merchant: null,
      note: 'books for college',
      date: new Date('2026-08-26T07:19:18.107Z'),
      createdAt: new Date('2026-08-26T07:19:18.107Z'),
    },
    {
      amount: 250,
      category: 'Food',
      merchant: 'Zomato',
      note: 'dinner with friends',
      date: new Date('2026-08-26T07:43:54.786Z'),
      createdAt: new Date('2026-08-26T07:43:54.786Z'),
    },
    {
      amount: 576,
      category: 'Travel',
      merchant: 'irstc',
      note: 'ticket',
      date: new Date('2026-08-26T05:33:00.326Z'),
      createdAt: new Date('2026-08-26T05:33:00.326Z'),
    },
    {
      amount: 444,
      category: 'Food',
      merchant: 'Zomato',
      note: 'lunch',
      date: new Date('2026-08-26T05:24:08.050Z'),
      createdAt: new Date('2026-08-26T05:24:08.050Z'),
    },
    {
      amount: 250,
      category: 'Food',
      merchant: 'Zomato',
      note: 'dinner with friends',
      date: new Date('2026-08-26T05:11:54.001Z'),
      createdAt: new Date('2026-08-26T05:11:54.001Z'),
    },
  ]

  await prisma.expense.createMany({
    data: expenses,
  })

  // Current monthly budget
  await prisma.budget.create({
    data: {
      amount: 6700,
    },
  })

  console.log('✅ Expenses added:', expenses.length)
  console.log('✅ Budget added: ₹6700')
  console.log('✅ PaisaWise Neon database is ready!')
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })