import e from 'express'
import { requireAuth } from '../../middlewares/auth-middleware.ts'
import { predictionController } from './prediction-controller.ts'

export const predictionRouter = e.Router()

predictionRouter.use(requireAuth)
predictionRouter.post('/persona', predictionController.createPersonaPrediction)
predictionRouter.get('/latest', predictionController.getLatest)
predictionRouter.get('/history', predictionController.listHistory)
