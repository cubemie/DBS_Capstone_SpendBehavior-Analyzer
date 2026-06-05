import * as z from 'zod'
import type { predictionResults } from '../../db/schemas/prediction-results.ts'
import { dateRangeSchema, paginationSchema } from '../../utils/query-schemas.ts'

export const createPersonaPredictionSchema = dateRangeSchema.extend({
  timezone: z.string().trim().min(1).default('Asia/Jakarta'),
  force: z.boolean().default(false),
})

export const predictionHistoryQuerySchema = dateRangeSchema.extend(
  paginationSchema.shape,
)

export const predictionWarningSchema = z.object({
  code: z.string().trim().min(1),
  title: z.string().trim().min(1),
  message: z.string().trim().min(1),
  label: z.string().trim().min(1),
  severity: z.enum(['info', 'warning', 'danger', 'success']),
})

export const mlPredictionResponseSchema = z.object({
  persona: z.string().trim().min(1),
  confidence: z.number().min(0).max(1),
  probabilities: z.object({
    emotional: z.number().min(0).max(1),
    impulsive: z.number().min(0).max(1),
    rational: z.number().min(0).max(1),
  }),
  smart_warnings_system: z.array(predictionWarningSchema),
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
