import e from 'express'
import { requireAuth } from '../../middlewares/auth-middleware.ts'
import { authController } from './auth-controller.ts'

export const authRouter = e.Router()

authRouter.post('/register', authController.register)
authRouter.post('/login', authController.login)
authRouter.post('/refresh', authController.refresh)
authRouter.post('/logout', authController.logout)
authRouter.get('/me', requireAuth, authController.me)
