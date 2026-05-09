import e from 'express'
import * as authController from '../controllers/auth.ts'

export const authRouter = e.Router()

authRouter.post('/', authController.login)
