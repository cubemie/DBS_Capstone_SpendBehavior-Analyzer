import jwt from 'jsonwebtoken'
import type { JwtPayload } from '../schemas/auth.ts'
import { env } from '../config.ts'
import { AppException } from '../exception.ts'

export function createAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1d' })
}

export function verifyAccessToken(token: string) {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload

    return payload
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppException('Sesi berakhir, silakan login ulang', 401)
    }

    throw new AppException('Akses ditolak. Token tidak valid', 401)
  }
}
