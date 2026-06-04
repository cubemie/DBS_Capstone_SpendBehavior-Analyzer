import * as z from 'zod'

export type LoginDto = z.infer<typeof loginSchema>
export type RegisterDto = z.infer<typeof registerSchema>

export type JwtPayload = {
  sub: string
  sessionId?: string
}

export type AuthSessionContext = {
  userAgent?: string
  ipAddress?: string
}

export const jwtPayloadSchema = z.object({
  sub: z.uuid(),
  sessionId: z.uuid().optional(),
})

export const loginSchema = z.object({
  email: z.email('Harus merupakan email yang valid'),
  password: z.string('Harus merupakan string yang valid'),
})

export const registerSchema = z.object({
  fullName: z.string('Harus merupakan string yang valid').trim(),
  email: z.email('Harus merupakan email yang valid'),
  password: z.string('Harus merupakan string yang valid').min(8),
  avatarUrl: z.url().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
})
