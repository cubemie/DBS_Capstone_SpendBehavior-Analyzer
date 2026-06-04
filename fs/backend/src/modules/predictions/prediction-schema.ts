import * as z from 'zod'
import type { predictionResults } from '../../db/schemas/prediction-results.ts'

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

export const createPersonaPredictionSchema = dateRangeSchema.extend({
  timezone: z.string().trim().min(1).default('Asia/Jakarta'),
  force: z.boolean().default(false),
})

export const predictionHistoryQuerySchema = dateRangeSchema.extend({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const mlPredictionResponseSchema = z.object({
  persona: z.string().trim().min(1),
  confidence: z.number().min(0).max(1),
  probabilities: z.object({
    emotional: z.number().min(0).max(1),
    impulsive: z.number().min(0).max(1),
    rational: z.number().min(0).max(1),
  }),
  smart_warnings_system: z.array(z.string()),
  money_leaks: z
    .array(
      z.object({
        category_id: z.string().trim().min(1),
        category: z.string().trim().min(1),
        txn_count: z.number().int().nonnegative(),
        total_amount: z.number().nonnegative(),
        severity: z.enum(['warning', 'danger']),
      }),
    )
    .default([]),
})

export type CreatePersonaPredictionDto = z.output<
  typeof createPersonaPredictionSchema
>
export type PredictionHistoryQueryDto = z.output<
  typeof predictionHistoryQuerySchema
>
export type MlPredictionResponseDto = z.output<
  typeof mlPredictionResponseSchema
>
export type PredictionResultRecord = typeof predictionResults.$inferSelect
export type PredictionResultResponseDto = PredictionResultRecord & {
  cached: boolean
}
export type PredictionHistoryResponseDto = {
  items: PredictionResultRecord[]
  page: number
  limit: number
  total: number
}
