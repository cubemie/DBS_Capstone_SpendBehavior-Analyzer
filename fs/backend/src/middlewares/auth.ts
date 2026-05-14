import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt.ts'
import { AppException } from '../exception.ts'

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppException('Akses ditolak, token tidak ditemukan', 401)
  }

  const token = authHeader.split(' ')[1]
  const payload = verifyAccessToken(token)

  req.payload = payload
  next()
}
