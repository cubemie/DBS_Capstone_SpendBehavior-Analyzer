import type { Request, Response } from 'express'
import {
  createUserSchema,
  getUserParamsSchema,
} from '../schemas/user-schema.ts'
import { sendData } from '../utils/response.ts'
import { AppException } from '../exception.ts'
import { userService } from '../services/user-service.ts'

export const userController = {
  async register(req: Request, res: Response) {
    const payload = createUserSchema.parse(req.body)

    const createdId = await userService.create(payload)

    sendData(res, { id: createdId }, 201)
  },

  async getDetails(req: Request, res: Response) {
    const { id } = getUserParamsSchema.parse(req.params)
    const jwtPayload = req.payload!

    if (id !== jwtPayload.sub) {
      throw new AppException('Aksi dilarang', 403)
    }

    const user = await userService.getDetails(id)

    sendData(res, user)
  },
}
