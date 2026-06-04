import type { Request, Response } from 'express'
import path from 'node:path'
import { changePasswordSchema, updateUserSchema } from './user-schema.ts'
import { env } from '../../config.ts'
import { AppException } from '../../exception.ts'
import { sendData } from '../../utils/response.ts'
import { userService } from './user-service.ts'

export const userController = {
  async updateMe(req: Request, res: Response) {
    const userId = req.payload!.sub
    const payload = updateUserSchema.parse(req.body)
    const user = await userService.update(userId, payload)

    sendData(res, user)
  },

  async updateMyAvatar(req: Request, res: Response) {
    const userId = req.payload!.sub

    if (!req.file) {
      throw new AppException('File avatar wajib diunggah', 400)
    }

    const avatarPath = path.posix.join('uploads', 'avatars', req.file.filename)
    const avatarUrl = new URL(avatarPath, `${env.APP_URL}/`).toString()
    const user = await userService.updateAvatar(userId, {
      avatarUrl,
      uploadedFilePath: req.file.path,
    })

    sendData(res, user)
  },

  async changeMyPassword(req: Request, res: Response) {
    const userId = req.payload!.sub
    const payload = changePasswordSchema.parse(req.body)
    await userService.changePassword(userId, payload)

    sendData(res, { success: true })
  },
}
