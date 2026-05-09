import e from 'express'
import { authRouter } from './routes/auth.ts'
import { userRouter } from './routes/user.ts'
import { errorHandler } from './middlewares/error.ts'

const app = e()

app.use(e.json())

app.get('/', (_, res) => {
  res.send('Hello World')
})

app.use('/authentications', authRouter)
app.use('/users', userRouter)

app.use(errorHandler)

export default app
