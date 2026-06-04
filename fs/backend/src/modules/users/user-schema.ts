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

export const updateUserSchema = z.object({
  fullName: z.string('Harus merupakan string yang valid').trim().optional(),
  phone: z.string().trim().optional().nullable(),
})
export type UpdateUserDto = z.infer<typeof updateUserSchema>

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
})
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>
