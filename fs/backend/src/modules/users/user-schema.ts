import * as z from 'zod'
import type { UserRecord } from './user-repository.ts'

export type UserResponseDto = Omit<UserRecord, 'passwordHash'>

export type CreateUserDto = z.infer<typeof createUserSchema>
export type UpdateUserDto = z.infer<typeof updateUserSchema>
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>

export const createUserSchema = z.object({
  fullName: z.string('Harus merupakan string yang valid').trim(),
  email: z.email('Harus merupakan email yang valid'),
  password: z.string('Harus merupakan string yang valid').min(8),
  avatarUrl: z.url().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
})

export const updateUserSchema = z.object({
  fullName: z.string().trim().optional(),
  phone: z.string().trim().optional().nullable(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
  avatarUrl: z.url().optional().nullable(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password lama wajib diisi'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
})

export const getUserParamsSchema = z.object({
  id: z.uuid('Harus merupakan format UUID yang valid'),
})
