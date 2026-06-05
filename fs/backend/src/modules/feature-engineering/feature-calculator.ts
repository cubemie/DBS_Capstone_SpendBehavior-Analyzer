import {
  buildFeatureVector,
  FEATURE_ORDER,
  isFeatureName,
  type FeatureName,
  type FeatureValues,
} from './feature-contract.ts'
import type { FeatureEngineeringResult } from './feature-schema.ts'
import { isWeekendInTimezone } from '../../utils/timezone.ts'

type FeatureCalculatorTransaction = {
  id: string
  amountIdr: number
  transactionDate: Date
  createdAt: Date
  categoryId: string
  categorySlug: string
  categoryMlKey: string | null
}

export type CalculateFeaturesOptions = {
  from?: string
  to?: string
  timezone: string
}

const NIGHT_START_HOUR = 20
const ROLLING_SPIKE_WINDOW_SIZE = 7

const CATEGORY_SLUG_FEATURES: Readonly<Record<string, FeatureName>> = {
  'makanan-and-minuman': 'cat_makanan_minuman_ratio',
  transportasi: 'cat_transportasi_ratio',
  'kesehatan-and-kecantikan': 'cat_kesehatan_kecantik_ratio',
  'sembako-and-kebutuhan-pokok': 'cat_sembako_kebutuhan__ratio',
  kesehatan: 'cat_kesehatan_ratio',
  pendidikan: 'cat_pendidikan_ratio',
  'belanja-online': 'cat_belanja_online_ratio',
  'pulsa-and-data': 'cat_pulsa_data_ratio',
  hiburan: 'cat_hiburan_ratio',
  'fashion-and-pakaian': 'cat_fashion_pakaian_ratio',
}

type LocalDateParts = {
  hour: number
  weekday: string
}

const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>()

function createEmptyFeatures(): FeatureValues {
  return {
    avg_txn_idr: 0,
    txn_count: 0,
    weekend_ratio: 0,
    night_ratio: 0,
    above_avg_ratio: 0,
    spike_ratio: 0,
    impulse_score: 0,
    unique_categories: 0,
    spending_cov: 0,
    cat_makanan_minuman_ratio: 0,
    cat_transportasi_ratio: 0,
    cat_kesehatan_kecantik_ratio: 0,
    cat_sembako_kebutuhan__ratio: 0,
    cat_kesehatan_ratio: 0,
    cat_pendidikan_ratio: 0,
    cat_belanja_online_ratio: 0,
    cat_pulsa_data_ratio: 0,
    cat_hiburan_ratio: 0,
    cat_fashion_pakaian_ratio: 0,
  }
}

function getFormatter(timezone: string): Intl.DateTimeFormat {
  const existing = dateTimeFormatters.get(timezone)
  if (existing) {
    return existing
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    hour: '2-digit',
    hourCycle: 'h23',
  })
  dateTimeFormatters.set(timezone, formatter)

  return formatter
}

function getLocalDateParts(date: Date, timezone: string): LocalDateParts {
  const parts = getFormatter(timezone).formatToParts(date)
  let hour = 0
  let weekday = ''

  for (const part of parts) {
    if (part.type === 'hour') {
      hour = Number(part.value) % 24
    }

    if (part.type === 'weekday') {
      weekday = part.value
    }
  }

  return { hour, weekday }
}

function isWeekend(date: Date, timezone: string): boolean {
  return isWeekendInTimezone(date, timezone)
}

function isNight(date: Date, timezone: string): boolean {
  const { hour } = getLocalDateParts(date, timezone)

  return hour >= NIGHT_START_HOUR
}

function roundToFourDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 10_000) / 10_000
}

function getSampleStandardDeviation(
  amounts: number[],
  average: number,
): number {
  if (amounts.length < 2) {
    return 0
  }

  const squaredDiffTotal = amounts.reduce((total, amount) => {
    const diff = amount - average

    return total + diff * diff
  }, 0)

  return Math.sqrt(squaredDiffTotal / (amounts.length - 1))
}

function countSpikes(transactions: FeatureCalculatorTransaction[]): number {
  let spikeCount = 0

  for (let index = 0; index < transactions.length; index += 1) {
    const windowStart = Math.max(0, index - ROLLING_SPIKE_WINDOW_SIZE + 1)
    const window = transactions.slice(windowStart, index + 1)
    const rollingMean =
      window.reduce((total, transaction) => total + transaction.amountIdr, 0) /
      window.length

    if (transactions[index]!.amountIdr > rollingMean * 2) {
      spikeCount += 1
    }
  }

  return spikeCount
}

function getCategoryFeature(
  transaction: FeatureCalculatorTransaction,
): FeatureName | undefined {
  if (transaction.categoryMlKey && isFeatureName(transaction.categoryMlKey)) {
    return transaction.categoryMlKey
  }

  return CATEGORY_SLUG_FEATURES[transaction.categorySlug]
}

function sortTransactions(
  transactions: readonly FeatureCalculatorTransaction[],
): FeatureCalculatorTransaction[] {
  return [...transactions].sort((left, right) => {
    const dateDiff =
      left.transactionDate.getTime() - right.transactionDate.getTime()
    if (dateDiff !== 0) {
      return dateDiff
    }

    const createdDiff = left.createdAt.getTime() - right.createdAt.getTime()
    if (createdDiff !== 0) {
      return createdDiff
    }

    return left.id.localeCompare(right.id)
  })
}

export function calculateFeatures(
  transactions: readonly FeatureCalculatorTransaction[],
  options: CalculateFeaturesOptions,
): FeatureEngineeringResult {
  const featuresByName = createEmptyFeatures()
  const sortedTransactions = sortTransactions(transactions)
  const transactionCount = sortedTransactions.length

  if (transactionCount === 0) {
    return {
      featureOrder: FEATURE_ORDER,
      featuresByName,
      featureVector: buildFeatureVector(featuresByName),
      transactionCount,
      period: {
        from: options.from,
        to: options.to,
      },
    }
  }

  const amounts = sortedTransactions.map((transaction) => transaction.amountIdr)
  const totalAmount = amounts.reduce((total, amount) => total + amount, 0)
  const averageAmount = totalAmount / transactionCount
  const weekendCount = sortedTransactions.filter((transaction) =>
    isWeekend(transaction.transactionDate, options.timezone),
  ).length
  const nightCount = sortedTransactions.filter((transaction) =>
    isNight(transaction.transactionDate, options.timezone),
  ).length
  const aboveAverageCount = sortedTransactions.filter(
    (transaction) => transaction.amountIdr > averageAmount,
  ).length
  const spikeCount = countSpikes(sortedTransactions)
  const uniqueCategories = new Set(
    sortedTransactions.map((transaction) => transaction.categoryId),
  ).size
  const standardDeviation = getSampleStandardDeviation(amounts, averageAmount)
  const categoryTotals = new Map<FeatureName, number>()

  for (const transaction of sortedTransactions) {
    const categoryFeature = getCategoryFeature(transaction)

    if (categoryFeature) {
      categoryTotals.set(
        categoryFeature,
        (categoryTotals.get(categoryFeature) ?? 0) + transaction.amountIdr,
      )
    }
  }

  featuresByName.avg_txn_idr = averageAmount
  featuresByName.txn_count = transactionCount
  featuresByName.weekend_ratio = weekendCount / transactionCount
  featuresByName.night_ratio = nightCount / transactionCount
  featuresByName.above_avg_ratio = aboveAverageCount / transactionCount
  featuresByName.spike_ratio = spikeCount / transactionCount
  featuresByName.unique_categories = uniqueCategories
  featuresByName.spending_cov =
    averageAmount === 0 ? 0 : standardDeviation / averageAmount
  featuresByName.impulse_score = roundToFourDecimals(
    featuresByName.weekend_ratio * 0.35 +
      featuresByName.night_ratio * 0.3 +
      featuresByName.above_avg_ratio * 0.2 +
      featuresByName.spike_ratio * 0.15,
  )

  for (const [featureName, categoryTotal] of categoryTotals) {
    featuresByName[featureName] =
      totalAmount === 0 ? 0 : categoryTotal / totalAmount
  }

  return {
    featureOrder: FEATURE_ORDER,
    featuresByName,
    featureVector: buildFeatureVector(featuresByName),
    transactionCount,
    period: {
      from: options.from,
      to: options.to,
    },
  }
}
