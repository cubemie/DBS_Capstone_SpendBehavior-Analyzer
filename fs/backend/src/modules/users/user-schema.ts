import * as z from 'zod'
import type { UserRecord } from './user-repository.ts'

export type UserResponseDto = Omit<UserRecord, 'passwordHash'>

export type CreateUserDto = z.infer<typeof createUserSchema>

export const createUserSchema = z.object({
  fullName: z.string('Harus merupakan string yang valid').trim(),
  email: z.email('Harus merupakan email yang valid'),
  password: z.string('Harus merupakan string yang valid').min(8),
  avatarUrl: z.url().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
})

export const getUserParamsSchema = z.object({
  id: z.uuid('Harus merupakan format UUID yang valid'),
})
