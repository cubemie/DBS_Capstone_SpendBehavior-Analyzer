import * as z from 'zod'
import { dateRangeSchema, paginationSchema } from '../../utils/query-schemas.ts'
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

export const listTransactionsQuerySchema = dateRangeSchema
  .extend(paginationSchema.shape)
  .extend({
    categoryId: z.uuid('Harus merupakan format UUID yang valid').optional(),
    type: transactionTypeSchema.optional(),
    search: z.string().trim().min(1).max(100).optional(),
    sort: z.enum(['date_desc', 'date_asc']).default('date_desc'),
  })

export const transactionSummaryQuerySchema = dateRangeSchema
