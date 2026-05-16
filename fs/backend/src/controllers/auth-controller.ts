import type { Request, Response } from 'express'
import { loginSchema } from '../schemas/auth-schema.ts'
import { sendData } from '../utils/response.ts'
import { authService } from '../services/auth-service.ts'

export const authController = {
  async login(req: Request, res: Response) {
    const payload = loginSchema.parse(req.body)

    const token = await authService.login(payload)

    sendData(res, token)
  },
}
