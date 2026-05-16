import e from 'express'
import { authRouter } from './routes/auth-route.ts'
import { userRouter } from './routes/user-route.ts'
import { errorHandler } from './middlewares/error-middleware.ts'

const app = e()

app.use(e.json())

app.get('/', (_, res) => {
  res.send('Hello World')
})

app.use('/authentications', authRouter)
app.use('/users', userRouter)

app.use(errorHandler)

export default app
