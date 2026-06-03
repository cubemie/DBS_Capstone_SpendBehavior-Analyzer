import { z } from 'zod'

export const emailSchema = z.string().email('Email tidak valid')

export const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .max(100, 'Password maksimal 100 karakter')

export const amountSchema = z
  .number({ invalid_type_error: 'Nominal harus berupa angka' })
  .positive('Nominal harus lebih dari 0')
  .max(999_999_999_999, 'Nominal terlalu besar')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password wajib diisi'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
    email: emailSchema,
    password: passwordSchema,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Konfirmasi password tidak cocok',
    path: ['password_confirmation'],
  })

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Password lama wajib diisi'),
    new_password: passwordSchema,
    new_password_confirmation: z.string(),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: 'Konfirmasi password tidak cocok',
    path: ['new_password_confirmation'],
  })

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], { required_error: 'Tipe transaksi wajib dipilih' }),
  amount: z.coerce.number().positive('Nominal harus lebih dari 0'),
  description: z.string().min(1, 'Deskripsi wajib diisi').max(255, 'Deskripsi maksimal 255 karakter'),
  category_id: z.string().uuid('Kategori wajib dipilih'),
  transaction_date: z.string().min(1, 'Tanggal wajib diisi'),
  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().nullable(),
})

export const budgetSchema = z.object({
  category_id: z.string().uuid('Kategori wajib dipilih'),
  amount: z.coerce.number().positive('Nominal budget harus lebih dari 0'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020),
})

export const profileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
  avatar_url: z.string().url('URL avatar tidak valid').optional().nullable().or(z.literal('')),
})
