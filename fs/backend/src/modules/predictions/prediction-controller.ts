import type { Request, Response } from 'express'
import { sendData } from '../../utils/response.ts'
import {
  createPersonaPredictionSchema,
  predictionHistoryQuerySchema,
} from './prediction-schema.ts'
import { predictionService } from './prediction-service.ts'

export const predictionController = {
  async createPersonaPrediction(req: Request, res: Response) {
    const userId = req.payload!.sub
    const payload = createPersonaPredictionSchema.parse(req.body)
    const prediction = await predictionService.createPersonaPrediction(
      userId,
      payload,
    )

    sendData(res, prediction, prediction.cached ? 200 : 201)
  },

  async getLatest(req: Request, res: Response) {
    const userId = req.payload!.sub
    const prediction = await predictionService.getLatest(userId)

    sendData(res, prediction)
  },

  async listHistory(req: Request, res: Response) {
    const userId = req.payload!.sub
    const query = predictionHistoryQuerySchema.parse(req.query)
    const predictions = await predictionService.listHistory(userId, query)

    sendData(res, predictions)
  },
}
