import e from 'express'
import { requireAuth } from '../../middlewares/auth-middleware.ts'
import { authController } from './auth-controller.ts'
import rateLimit from 'express-rate-limit'

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' },
})

export const authRouter = e.Router()

authRouter.post('/register', authLimiter, authController.register)
authRouter.post('/login', authLimiter, authController.login)
authRouter.post('/refresh', authController.refresh)
authRouter.post('/logout', authController.logout)
authRouter.get('/me', requireAuth, authController.me)
