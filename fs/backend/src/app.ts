import e from 'express'
import cookieParser from 'cookie-parser'
import { authRouter } from './routes/auth-route.ts'
import { errorHandler } from './middlewares/error-middleware.ts'

const app = e()

app.use(e.json())
app.use(cookieParser())

app.get('/', (_, res) => {
  res.send('Hello World')
})

app.use('/api/v1/auth', authRouter)

app.use(errorHandler)

export default app
