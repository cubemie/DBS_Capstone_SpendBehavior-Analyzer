import type { Request, Response } from 'express'
import {
  changePasswordSchema,
  createUserSchema,
  getUserParamsSchema,
  updateUserSchema,
} from './user-schema.ts'
import { AppException } from '../../exception.ts'
import { sendData } from '../../utils/response.ts'
import { userService } from './user-service.ts'

export const userController = {
  // [POST /users] — registrasi via users route (legacy, auth pakai /auth/register)
  async register(req: Request, res: Response) {
    const payload = createUserSchema.parse(req.body)
    const createdId = await userService.create(payload)
    sendData(res, { id: createdId }, 201)
  },

  // [GET /users/:id] — get detail user by ID (auth required, hanya milik sendiri)
  async getDetails(req: Request, res: Response) {
    const { id } = getUserParamsSchema.parse(req.params)
    const jwtPayload = req.payload!

    if (id !== jwtPayload.sub) {
      throw new AppException('Aksi dilarang', 403)
    }

    const user = await userService.getDetails(id)
    sendData(res, user)
  },

  // [GET /users/me] — get profil user yang sedang login
  async getMe(req: Request, res: Response) {
    const { sub } = req.payload!
    const user = await userService.getDetails(sub)
    sendData(res, user)
  },

  // [PUT /users/me] — update profil user yang sedang login
  async updateMe(req: Request, res: Response) {
    const { sub } = req.payload!
    const payload = updateUserSchema.parse(req.body)
    const user = await userService.updateMe(sub, payload)
    sendData(res, user)
  },

  // [PUT /users/me/password] — ganti password
  async changePassword(req: Request, res: Response) {
    const { sub } = req.payload!
    const payload = changePasswordSchema.parse(req.body)
    await userService.changePassword(sub, payload)
    res.status(204).send()
  },

  // [DELETE /users/me] — hapus akun sendiri
  async deleteMe(req: Request, res: Response) {
    const { sub } = req.payload!
    await userService.deleteMe(sub)
    res.status(204).send()
  },
}
