import e from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { analyticsRouter } from './modules/analytics/analytics-route.ts'
import { authRouter } from './modules/auth/auth-route.ts'
import { categoryRouter } from './modules/categories/category-route.ts'
import { errorHandler } from './middlewares/error-middleware.ts'
import { predictionRouter } from './modules/predictions/prediction-route.ts'
import { transactionRouter } from './modules/transactions/transaction-route.ts'
import { userRouter } from './modules/users/user-route.ts'

const app = e()

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Sesuaikan dengan origin frontend
    credentials: true, // Izinkan pengiriman cookie
  }),
)

app.use(e.json())
app.use(cookieParser())

app.get('/', (_, res) => {
  res.send('Hello World')
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/categories', categoryRouter)
app.use('/api/v1/transactions', transactionRouter)
app.use('/api/v1/predictions', predictionRouter)
app.use('/api/v1/analytics', analyticsRouter)

app.use(errorHandler)

export default app
