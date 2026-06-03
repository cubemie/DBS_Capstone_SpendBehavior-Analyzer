import e from 'express'
import { requireAuth } from '../../middlewares/auth-middleware.ts'
import { analyticsController } from './analytics-controller.ts'

export const analyticsRouter = e.Router()

analyticsRouter.use(requireAuth)
analyticsRouter.get('/dashboard', analyticsController.getDashboard)
