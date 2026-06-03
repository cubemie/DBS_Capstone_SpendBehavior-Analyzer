import {
  and,
  desc,
  eq,
  gte,
  isNull,
  lte,
  sql,
  type SQL,
} from 'drizzle-orm'
import { db } from '../../db/index.ts'
import {
  predictionResults,
  type PredictionFeatures,
  type PredictionMlResponse,
  type PredictionProbabilities,
} from '../../db/schemas/prediction-results.ts'

export type PredictionRecord = typeof predictionResults.$inferSelect

export type CreatePredictionRecord = {
  userId: string
  periodFrom?: Date | null
  periodTo?: Date | null
  timezone: string
  persona: string
  confidence: number
  probabilities: PredictionProbabilities
  warnings: string[]
  featureOrder: string[]
  features: PredictionFeatures
  featureVectorHash: string
  transactionCount: number
  mlResponse: PredictionMlResponse
}

export type PredictionHistoryFilters = {
  userId: string
  page: number
  limit: number
  from?: string
  to?: string
}

export type PredictionPeriodFilters = {
  userId: string
  from?: string
  to?: string
  timezone: string
}

function getBaseFilters(userId: string): SQL[] {
  return [eq(predictionResults.userId, userId)]
}

function addDateRangeFilters(filters: SQL[], from?: string, to?: string): void {
  if (from) {
    filters.push(gte(predictionResults.createdAt, new Date(from)))
  }

  if (to) {
    filters.push(lte(predictionResults.createdAt, new Date(to)))
  }
}

export const predictionRepository = {
  async create(record: CreatePredictionRecord): Promise<PredictionRecord> {
    const [prediction] = await db
      .insert(predictionResults)
      .values(record)
      .returning()

    return prediction
  },

  async findLatest(userId: string): Promise<PredictionRecord | undefined> {
    const [prediction] = await db
      .select()
      .from(predictionResults)
      .where(eq(predictionResults.userId, userId))
      .orderBy(desc(predictionResults.createdAt))
      .limit(1)

    return prediction
  },

  async findLatestForPeriod(
    filters: PredictionPeriodFilters,
  ): Promise<PredictionRecord | undefined> {
    const conditions = [
      eq(predictionResults.userId, filters.userId),
      eq(predictionResults.timezone, filters.timezone),
      filters.from
        ? eq(predictionResults.periodFrom, new Date(filters.from))
        : isNull(predictionResults.periodFrom),
      filters.to
        ? eq(predictionResults.periodTo, new Date(filters.to))
        : isNull(predictionResults.periodTo),
    ]

    const [prediction] = await db
      .select()
      .from(predictionResults)
      .where(and(...conditions))
      .orderBy(desc(predictionResults.createdAt))
      .limit(1)

    return prediction
  },

  async findLatestByFeatureHash(
    userId: string,
    featureVectorHash: string,
  ): Promise<PredictionRecord | undefined> {
    const [prediction] = await db
      .select()
      .from(predictionResults)
      .where(
        and(
          eq(predictionResults.userId, userId),
          eq(predictionResults.featureVectorHash, featureVectorHash),
        ),
      )
      .orderBy(desc(predictionResults.createdAt))
      .limit(1)

    return prediction
  },

  async findMany(
    filters: PredictionHistoryFilters,
  ): Promise<{ items: PredictionRecord[]; total: number }> {
    const conditions = getBaseFilters(filters.userId)
    addDateRangeFilters(conditions, filters.from, filters.to)
    const where = and(...conditions)

    const items = await db
      .select()
      .from(predictionResults)
      .where(where)
      .orderBy(desc(predictionResults.createdAt))
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit)

    const [countRow] = await db
      .select({
        total: sql<number>`count(*)`.mapWith(Number),
      })
      .from(predictionResults)
      .where(where)

    return {
      items,
      total: countRow?.total ?? 0,
    }
  },
}
