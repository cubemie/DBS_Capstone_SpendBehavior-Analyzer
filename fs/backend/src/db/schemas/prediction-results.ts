import {
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './users.ts'

export type PredictionProbabilities = {
  emotional: number
  impulsive: number
  rational: number
}

export type PredictionFeatures = Record<string, number>

export type PredictionWarningSeverity = 'info' | 'warning' | 'danger' | 'success'

export type PredictionWarning = {
  code: string
  title: string
  message: string
  label: string
  severity: PredictionWarningSeverity
}

export type PredictionStoredWarning = PredictionWarning | string

export type PredictionMlResponse = {
  persona: string
  confidence: number
  probabilities: PredictionProbabilities
  smart_warnings_system: PredictionWarning[]
  money_leaks?: PredictionMoneyLeak[]
}

export type PredictionMoneyLeak = {
  category_id: string
  category: string
  txn_count: number
  total_amount: number
  severity: 'warning' | 'danger'
}

export const predictionResults = pgTable(
  'prediction_results',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    periodFrom: timestamp({ withTimezone: true }),
    periodTo: timestamp({ withTimezone: true }),
    timezone: text().notNull(),
    persona: text().notNull(),
    confidence: doublePrecision().notNull(),
    probabilities: jsonb().$type<PredictionProbabilities>().notNull(),
    warnings: jsonb().$type<PredictionStoredWarning[]>().notNull(),
    featureOrder: text().array().notNull(),
    features: jsonb().$type<PredictionFeatures>().notNull(),
    featureVectorHash: text().notNull(),
    transactionCount: integer().notNull(),
    mlResponse: jsonb().$type<PredictionMlResponse>().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('prediction_results_user_created_idx').on(
      table.userId,
      table.createdAt,
    ),
    index('prediction_results_user_feature_hash_idx').on(
      table.userId,
      table.featureVectorHash,
    ),
  ],
)
