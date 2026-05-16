import * as z from 'zod'

export type LoginDto = z.infer<typeof loginSchema>

export type AuthResponseDto = {
  accessToken: string
}

export type JwtPayload = {
  sub: string
}

export const loginSchema = z.object({
  email: z.email('Harus merupakan email yang valid'),
  password: z.string('Harus merupakan string yang valid'),
})
