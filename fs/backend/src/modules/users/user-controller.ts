import type { Request, Response } from 'express'
import { changePasswordSchema, updateUserSchema } from './user-schema.ts'
import { sendData } from '../../utils/response.ts'
import { userService } from './user-service.ts'

export const userController = {
  async updateMe(req: Request, res: Response) {
    const userId = req.payload!.sub
    const payload = updateUserSchema.parse(req.body)
    const user = await userService.update(userId, payload)

    sendData(res, user)
  },

  async changeMyPassword(req: Request, res: Response) {
    const userId = req.payload!.sub
    const payload = changePasswordSchema.parse(req.body)
    await userService.changePassword(userId, payload)

    sendData(res, { success: true })
  },
}
