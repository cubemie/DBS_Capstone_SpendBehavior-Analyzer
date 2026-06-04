import type { Request, Response } from 'express'
import { listCategoriesQuerySchema } from './category-schema.ts'
import { sendData } from '../../utils/response.ts'
import { categoryService } from './category-service.ts'

export const categoryController = {
  async list(req: Request, res: Response) {
    const query = listCategoriesQuerySchema.parse(req.query)
    const categories = await categoryService.list(query)

    sendData(res, categories)
  },
}
