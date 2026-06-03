import e from 'express'
import cookieParser from 'cookie-parser'
import { authRouter } from './modules/auth/auth-route.ts'
import { categoryRouter } from './modules/categories/category-route.ts'
import { errorHandler } from './middlewares/error-middleware.ts'
import { predictionRouter } from './modules/predictions/prediction-route.ts'
import { transactionRouter } from './modules/transactions/transaction-route.ts'

const app = e()

app.use(e.json())
app.use(cookieParser())

app.get('/', (_, res) => {
  res.send('Hello World')
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/categories', categoryRouter)
app.use('/api/v1/transactions', transactionRouter)
app.use('/api/v1/predictions', predictionRouter)

app.use(errorHandler)

export default app
