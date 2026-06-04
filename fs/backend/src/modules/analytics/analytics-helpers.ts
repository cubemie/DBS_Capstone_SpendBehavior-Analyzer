import type { TransactionSummary } from '../transactions/transaction-repository.ts'
import type {
  DashboardInsight,
  DashboardMoneyLeak,
  DashboardPeriod,
  DashboardWarning,
  DashboardWarningSeverity,
} from './analytics-schema.ts'
import type {
  ExpenseTrendRecord,
  TopCategoryRecord,
} from './analytics-repository.ts'
import type { PredictionMoneyLeak } from '../../db/schemas/prediction-results.ts'

type PeriodInput = {
  from?: string
  to?: string
  timezone: string
}

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

function getZonedParts(
  date: Date,
  timezone: string,
): {
  year: number
  month: number
  day: number
} {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const getPart = (type: string): number => {
    const value = parts.find((part) => part.type === type)?.value

    return value ? Number(value) : 0
  }

  return {
    year: getPart('year'),
    month: getPart('month'),
    day: getPart('day'),
  }
}

function getTimeZoneOffsetMs(date: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  }).formatToParts(date)
  const offset = parts.find((part) => part.type === 'timeZoneName')?.value

  if (!offset || offset === 'GMT') {
    return 0
  }

  const match = /^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/.exec(offset)
  if (!match) {
    return 0
  }

  const sign = match[1] === '-' ? -1 : 1
  const hours = Number(match[2])
  const minutes = match[3] ? Number(match[3]) : 0

  return sign * (hours * 60 + minutes) * 60 * 1000
}

function createDateInTimezone(
  year: number,
  month: number,
  day: number,
  timezone: string,
): Date {
  const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  const offsetMs = getTimeZoneOffsetMs(utcDate, timezone)

  return new Date(utcDate.getTime() - offsetMs)
}

function getMonthStart(date: Date, timezone: string): Date {
  const parts = getZonedParts(date, timezone)

  return createDateInTimezone(parts.year, parts.month, 1, timezone)
}

export function normalizeDashboardPeriod(
  input: PeriodInput,
  now: Date = new Date(),
): DashboardPeriod {
  const toDate = input.to ? new Date(input.to) : now
  const fromDate = input.from
    ? new Date(input.from)
    : getMonthStart(toDate, input.timezone)

  return {
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
    timezone: input.timezone,
  }
}

export function calculateSavingRatePercent(
  summary: TransactionSummary,
): number {
  if (summary.incomeTotalIdr <= 0) {
    return 0
  }

  return Math.round(
    ((summary.incomeTotalIdr - summary.expenseTotalIdr) /
      summary.incomeTotalIdr) *
      100,
  )
}

function cleanWarningText(message: string): string {
  return message.replace(/^[^\p{Letter}\p{Number}]+/u, '').trim()
}

function getWarningMetadata(message: string): {
  title: string
  label: string
  severity: DashboardWarningSeverity
} {
  const normalized = message.toLowerCase()

  if (normalized.includes('variability') || normalized.includes('fluktuasi')) {
    return {
      title: 'Nominal Transaksi Tidak Stabil',
      label: 'Variasi',
      severity: 'info',
    }
  }

  if (normalized.includes('weekend') || normalized.includes('akhir pekan')) {
    return {
      title: 'Pengeluaran Akhir Pekan Tinggi',
      label: 'Weekend',
      severity: 'warning',
    }
  }

  if (normalized.includes('night') || normalized.includes('malam')) {
    return {
      title: 'Transaksi Malam Meningkat',
      label: 'Malam',
      severity: 'warning',
    }
  }

  if (normalized.includes('impulsive') || normalized.includes('impulsif')) {
    return {
      title: 'Pola Impulsif Terdeteksi',
      label: 'Impulsif',
      severity: 'danger',
    }
  }

  if (normalized.includes('stabil') || normalized.includes('tidak ada')) {
    return {
      title: 'Pola Pengeluaran Stabil',
      label: 'Aman',
      severity: 'success',
    }
  }

  return {
    title: 'Peringatan Pengeluaran',
    label: 'Sinyal',
    severity: 'info',
  }
}

export function mapPredictionWarnings(
  messages: readonly string[],
): DashboardWarning[] {
  return messages.map((message, index) => {
    const metadata = getWarningMetadata(message)

    return {
      id: `warning-${index + 1}`,
      title: metadata.title,
      description: cleanWarningText(message),
      label: metadata.label,
      severity: metadata.severity,
      source: 'prediction',
    }
  })
}

export function mapMoneyLeaks(
  leaks: readonly PredictionMoneyLeak[],
): DashboardMoneyLeak[] {
  return leaks.map((leak, index) => {
    const totalAmountIdr = Math.round(leak.total_amount)

    return {
      id: `money-leak-${index + 1}`,
      title: `${leak.category} Sering Kecil-Kecil`,
      description: `${leak.txn_count} transaksi kecil di ${leak.category} mencapai Rp ${totalAmountIdr.toLocaleString('id-ID')}.`,
      label: `Rp ${totalAmountIdr.toLocaleString('id-ID')}`,
      severity: leak.severity,
      categoryId: leak.category_id,
      amountIdr: totalAmountIdr,
      transactionCount: leak.txn_count,
    }
  })
}

export function buildWeeklyTrend(
  transactions: readonly ExpenseTrendRecord[],
  period: DashboardPeriod,
): Array<{ label: string; from: string; to: string; expenseTotalIdr: number }> {
  const fromTime = new Date(period.from).getTime()
  const toTime = new Date(period.to).getTime()
  const weekCount = Math.max(1, Math.ceil((toTime - fromTime + 1) / WEEK_MS))
  const buckets = Array.from({ length: weekCount }, (_, index) => {
    const bucketFromTime = fromTime + index * WEEK_MS
    const bucketToTime = Math.min(bucketFromTime + WEEK_MS - 1, toTime)

    return {
      label: `M${index + 1}`,
      from: new Date(bucketFromTime).toISOString(),
      to: new Date(bucketToTime).toISOString(),
      expenseTotalIdr: 0,
    }
  })

  for (const transaction of transactions) {
    const index = Math.min(
      buckets.length - 1,
      Math.max(
        0,
        Math.floor(
          (transaction.transactionDate.getTime() - fromTime) / WEEK_MS,
        ),
      ),
    )
    buckets[index]!.expenseTotalIdr += transaction.amountIdr
  }

  return buckets
}

function getLocalWeekday(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  }).format(date)
}

function isWeekend(date: Date, timezone: string): boolean {
  const weekday = getLocalWeekday(date, timezone)

  return weekday === 'Sat' || weekday === 'Sun'
}

function countDayTypes(period: DashboardPeriod): {
  weekdayCount: number
  weekendCount: number
} {
  let weekdayCount = 0
  let weekendCount = 0
  const from = new Date(period.from)
  const to = new Date(period.to)
  const startParts = getZonedParts(from, period.timezone)
  const endParts = getZonedParts(to, period.timezone)
  let cursor = createDateInTimezone(
    startParts.year,
    startParts.month,
    startParts.day,
    period.timezone,
  )
  const end = createDateInTimezone(
    endParts.year,
    endParts.month,
    endParts.day,
    period.timezone,
  )

  while (cursor.getTime() <= end.getTime()) {
    if (isWeekend(cursor, period.timezone)) {
      weekendCount += 1
    } else {
      weekdayCount += 1
    }

    cursor = new Date(cursor.getTime() + DAY_MS)
  }

  return { weekdayCount, weekendCount }
}

export function buildWeekdayWeekendSummary(
  transactions: readonly ExpenseTrendRecord[],
  period: DashboardPeriod,
): {
  weekdayTotalIdr: number
  weekendTotalIdr: number
  weekdayAverageDailyIdr: number
  weekendAverageDailyIdr: number
} {
  let weekdayTotalIdr = 0
  let weekendTotalIdr = 0

  for (const transaction of transactions) {
    if (isWeekend(transaction.transactionDate, period.timezone)) {
      weekendTotalIdr += transaction.amountIdr
    } else {
      weekdayTotalIdr += transaction.amountIdr
    }
  }

  const dayTypes = countDayTypes(period)

  return {
    weekdayTotalIdr,
    weekendTotalIdr,
    weekdayAverageDailyIdr:
      dayTypes.weekdayCount === 0
        ? 0
        : Math.round(weekdayTotalIdr / dayTypes.weekdayCount),
    weekendAverageDailyIdr:
      dayTypes.weekendCount === 0
        ? 0
        : Math.round(weekendTotalIdr / dayTypes.weekendCount),
  }
}

export function buildInsights(input: {
  summary: TransactionSummary
  savingRatePercent: number
  topCategories: readonly TopCategoryRecord[]
  warnings: readonly DashboardWarning[]
  moneyLeaks: readonly DashboardMoneyLeak[]
}): DashboardInsight[] {
  const insights: DashboardInsight[] = []
  const topCategory = input.topCategories[0]

  if (topCategory && topCategory.percentage >= 40) {
    insights.push({
      id: 'insight-top-category',
      title: `Cek ${topCategory.name}`,
      description: `${topCategory.name} menyerap ${topCategory.percentage}% pengeluaran periode ini.`,
      tone: 'coral',
    })
  }

  if (input.moneyLeaks.length > 0) {
    insights.push({
      id: 'insight-money-leak',
      title: 'Kurangi Transaksi Kecil Berulang',
      description:
        'Ada transaksi kecil yang berulang dan totalnya mulai terasa.',
      tone: 'yellow',
    })
  }

  if (input.savingRatePercent >= 20) {
    insights.push({
      id: 'insight-saving-rate',
      title: 'Ruang Menabung Bagus',
      description: `Saving rate periode ini ${input.savingRatePercent}%. Pertahankan pola ini.`,
      tone: 'teal',
    })
  }

  if (
    input.summary.transactionCount > 0 &&
    input.warnings.every((warning) => warning.severity === 'success')
  ) {
    insights.push({
      id: 'insight-stable',
      title: 'Ritme Stabil',
      description:
        'Belum ada sinyal pengeluaran berisiko dari prediksi terakhir.',
      tone: 'neutral',
    })
  }

  return insights.slice(0, 3)
}
