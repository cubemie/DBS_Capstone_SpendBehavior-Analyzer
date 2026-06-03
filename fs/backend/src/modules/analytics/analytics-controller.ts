import type { Request, Response } from 'express'
import { sendData } from '../../utils/response.ts'
import { dashboardQuerySchema } from './analytics-schema.ts'
import { analyticsService } from './analytics-service.ts'

export const analyticsController = {
  async getDashboard(req: Request, res: Response) {
    const userId = req.payload!.sub
    const query = dashboardQuerySchema.parse(req.query)
    const dashboard = await analyticsService.getDashboard(userId, query)

    sendData(res, dashboard)
  },
}
