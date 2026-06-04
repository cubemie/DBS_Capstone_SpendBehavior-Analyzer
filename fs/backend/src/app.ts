import e from 'express'
import cookieParser from 'cookie-parser'
import path from 'node:path'
import { analyticsRouter } from './modules/analytics/analytics-route.ts'
import { authRouter } from './modules/auth/auth-route.ts'
import { categoryRouter } from './modules/categories/category-route.ts'
import { errorHandler } from './middlewares/error-middleware.ts'
import { predictionRouter } from './modules/predictions/prediction-route.ts'
import { transactionRouter } from './modules/transactions/transaction-route.ts'
import { userRouter } from './modules/users/user-route.ts'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config.ts'
import { requestLogger } from './middlewares/request-logger.ts'

const app = e()

app.use(helmet())
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
)
app.use(requestLogger)

app.use(e.json())
app.use(cookieParser())
app.use(
  '/uploads',
  e.static(path.resolve('uploads'), {
    setHeaders(res) {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    },
  }),
)

app.get('/', (_, res) => {
  res.json({
    status: 'ok',
    name: 'SpendBehavior Analyzer API',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      categories: '/api/v1/categories',
      transactions: '/api/v1/transactions',
      predictions: '/api/v1/predictions',
      analytics: '/api/v1/analytics',
    },
  })
})

app.get('/health', (_, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

// Konfigurasi route-route
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/categories', categoryRouter)
app.use('/api/v1/transactions', transactionRouter)
app.use('/api/v1/predictions', predictionRouter)
app.use('/api/v1/analytics', analyticsRouter)

app.use(errorHandler)

export default app
