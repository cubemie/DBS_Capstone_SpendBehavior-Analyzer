import * as z from 'zod'

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

export type DashboardInsight = {
  id: string
  title: string
  description: string
  tone: DashboardInsightTone
}
