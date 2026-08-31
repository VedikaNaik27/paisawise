import 'dotenv/config'
import { parseExpense } from './services/aiParser.js'

const result = await parseExpense('250 zomato dinner with friends')

console.log(result)