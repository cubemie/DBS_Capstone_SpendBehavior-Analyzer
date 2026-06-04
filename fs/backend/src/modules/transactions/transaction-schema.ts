import * as z from 'zod'
import { categoryKindSchema } from '../categories/category-schema.ts'

export const transactionTypeSchema = categoryKindSchema

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>
export type UpdateTransactionDto = z.infer<typeof updateTransactionSchema>
export type ListTransactionsQueryDto = z.infer<
  typeof listTransactionsQuerySchema
>

const textFieldSchema = z
  .string('Harus merupakan string yang valid')
  .trim()
  .min(1)

const optionalTextFieldSchema = textFieldSchema.optional().nullable()

const dateRangeSchema = z
  .object({
    from: z.iso.datetime({ offset: true }).optional(),
    to: z.iso.datetime({ offset: true }).optional(),
  })
  .refine(
    (value) => {
      if (!value.from || !value.to) {
        return true
      }

      return new Date(value.from).getTime() <= new Date(value.to).getTime()
    },
    {
      message: 'Tanggal awal tidak boleh setelah tanggal akhir',
      path: ['from'],
    },
  )

export const transactionParamsSchema = z.object({
  id: z.uuid('Harus merupakan format UUID yang valid'),
})

export const createTransactionSchema = z.object({
  categoryId: z.uuid('Harus merupakan format UUID yang valid'),
  title: textFieldSchema.max(120),
  merchantName: optionalTextFieldSchema,
  paymentMethod: optionalTextFieldSchema,
  type: transactionTypeSchema,
  amountIdr: z.number().int().positive().safe(),
  transactionDate: z.iso.datetime({ offset: true }),
  notes: optionalTextFieldSchema,
})

export const updateTransactionSchema = createTransactionSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Minimal satu field harus diisi',
  })

export const listTransactionsQuerySchema = dateRangeSchema.extend({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  categoryId: z.uuid('Harus merupakan format UUID yang valid').optional(),
  type: transactionTypeSchema.optional(),
  search: z.string().trim().min(1).max(100).optional(),
  sort: z.enum(['date_desc', 'date_asc']).default('date_desc'),
})

export const transactionSummaryQuerySchema = dateRangeSchema
