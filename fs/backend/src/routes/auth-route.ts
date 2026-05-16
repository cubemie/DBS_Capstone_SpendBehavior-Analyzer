import e from 'express'
import { authController } from '../controllers/auth-controller.ts'

export const authRouter = e.Router()

authRouter.post('/', authController.login)
