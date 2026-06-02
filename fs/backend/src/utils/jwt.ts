import jwt from 'jsonwebtoken'
import {
  type JwtPayload,
  jwtPayloadSchema,
} from '../schemas/auth-schema.ts'
import { env } from '../config.ts'
import { AppException } from '../exception.ts'

export function createAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  })
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decodedPayload = jwt.verify(token, env.JWT_SECRET)
    const payload = jwtPayloadSchema.parse(decodedPayload)

    return payload
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppException('Sesi berakhir, silakan login ulang', 401)
    }

    throw new AppException('Akses ditolak. Token tidak valid', 401)
  }
}
