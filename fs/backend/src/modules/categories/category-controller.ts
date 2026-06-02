import type { Request, Response } from 'express'
import {
  categoryParamsSchema,
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
} from './category-schema.ts'
import { sendData } from '../../utils/response.ts'
import { categoryService } from './category-service.ts'

export const categoryController = {
  async list(req: Request, res: Response) {
    const userId = req.payload!.sub
    const query = listCategoriesQuerySchema.parse(req.query)
    const categories = await categoryService.list(userId, query)

    sendData(res, categories)
  },

  async create(req: Request, res: Response) {
    const userId = req.payload!.sub
    const payload = createCategorySchema.parse(req.body)
    const category = await categoryService.create(userId, payload)

    sendData(res, category, 201)
  },

  async update(req: Request, res: Response) {
    const userId = req.payload!.sub
    const { id } = categoryParamsSchema.parse(req.params)
    const payload = updateCategorySchema.parse(req.body)
    const category = await categoryService.update(userId, id, payload)

    sendData(res, category)
  },

  async delete(req: Request, res: Response) {
    const userId = req.payload!.sub
    const { id } = categoryParamsSchema.parse(req.params)
    await categoryService.delete(userId, id)

    res.status(204).send()
  },
}
