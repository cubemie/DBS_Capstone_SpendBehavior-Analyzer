import * as z from 'zod'

export interface User {
  id: string
  fullName: string
  email: string
  avatarUrl: string | null
  passwordHash: string
  updatedAt: Date
  createdAt: Date
}

export type UserResponseDto = Omit<User, 'passwordHash'>

export type CreateUserDto = z.infer<typeof createUserSchema>

export const createUserSchema = z.object({
  fullName: z.string('Harus merupakan string yang valid').trim(),
  email: z.email('Harus merupakan email yang valid'),
  password: z.string('Harus merupakan string yang valid'),
  avatarUrl: z.string(),
})

export const getUserParamsSchema = z.object({
  id: z.uuid('Harus merupakan format UUID yang valid'),
})
