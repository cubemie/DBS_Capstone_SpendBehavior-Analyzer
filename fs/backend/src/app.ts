import e from 'express'
import cookieParser from 'cookie-parser'
import { authRouter } from './routes/auth-route.ts'
import { categoryRouter } from './routes/category-route.ts'
import { errorHandler } from './middlewares/error-middleware.ts'
import { transactionRouter } from './routes/transaction-route.ts'

const app = e()

app.use(e.json())
app.use(cookieParser())

app.get('/', (_, res) => {
  res.send('Hello World')
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/categories', categoryRouter)
app.use('/api/v1/transactions', transactionRouter)

app.use(errorHandler)

export default app
