import type { Request, Response } from 'express'
import { createUserSchema, getUserParamsSchema } from '../schemas/user.ts'
import * as userService from '../services/user.ts'
import { sendData } from '../utils/response.ts'
import { AppException } from '../exception.ts'

export async function register(req: Request, res: Response) {
  const payload = createUserSchema.parse(req.body)

  const createdId = await userService.newUser(payload)

  sendData(res, { id: createdId }, 201)
}

export async function getUserDetails(req: Request, res: Response) {
  const { id } = getUserParamsSchema.parse(req.params)
  const jwtPayload = req.payload!

  if (id !== jwtPayload.sub) {
    throw new AppException('Aksi dilarang', 403)
  }

  const user = await userService.getUserDetails(id)

  sendData(res, user)
}
