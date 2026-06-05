import * as z from 'zod'
import { dateRangeSchema } from '../../utils/query-schemas.ts'

export const dashboardQuerySchema = dateRangeSchema.extend({
  timezone: z.string().trim().min(1).default('Asia/Jakarta'),
})

export type DashboardQueryDto = z.output<typeof dashboardQuerySchema>

export type DashboardWarningSeverity = 'info' | 'warning' | 'danger' | 'success'

export type DashboardInsightTone = 'teal' | 'coral' | 'yellow' | 'neutral'

export type DashboardPeriod = {
  from: string
  to: string
  timezone: string
}

export type DashboardWarning = {
  id: string
  code?: string
  title: string
  description: string
  label: string
  severity: DashboardWarningSeverity
  source: 'prediction'
}

export type DashboardMoneyLeak = {
  id: string
  title: string
  description: string
  label: string
  severity: 'warning' | 'danger'
  categoryId: string
  amountIdr: number
  transactionCount: number
}

export type DashboardPredictionStatus = {
  state: 'empty' | 'missing' | 'stale' | 'fresh'
  transactionCount: number
  lastPredictedAt?: Date
  predictionSource: 'period' | null
}

export type DashboardInsight = {
  id: string
  title: string
  description: string
  tone: DashboardInsightTone
}
