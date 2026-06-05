import type { Request } from 'express'
import type { JwtPayload } from '../modules/auth/auth-schema.ts'
import { AppException } from '../exception.ts'

export function getAuthPayload(req: Request): JwtPayload {
  if (!req.payload) {
    throw new AppException('Akses ditolak, token tidak ditemukan', 401)
  }

  return req.payload
}
