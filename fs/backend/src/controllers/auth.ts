import type { Request, Response } from 'express'
import * as userService from '../services/auth.ts'
import { loginSchema } from '../schemas/auth.ts'
import { sendData } from '../utils/response.ts'

export async function login(req: Request, res: Response) {
  const payload = loginSchema.parse(req.body)

  const token = await userService.authenticate(payload)

  sendData(res, token)
}
