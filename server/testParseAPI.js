const response = await fetch('http://localhost:5000/api/expenses/parse', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: '250 zomato dinner with friends',
  }),
})

const data = await response.json()

console.log(data)