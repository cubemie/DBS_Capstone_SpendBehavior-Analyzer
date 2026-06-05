import * as z from 'zod'
import { dateRangeSchema } from '../../utils/query-schemas.ts'
import type {
  FeatureName,
  FeatureValues,
  FeatureVector,
} from './feature-contract.ts'

export const buildFeaturesOptionsSchema = dateRangeSchema.extend({
  timezone: z.string().trim().min(1).default('Asia/Jakarta'),
})

export type BuildFeaturesOptionsDto = z.input<typeof buildFeaturesOptionsSchema>

export type FeatureEngineeringResult = {
  featureOrder: readonly FeatureName[]
  featuresByName: FeatureValues
  featureVector: FeatureVector
  transactionCount: number
  period: {
    from?: string
    to?: string
  }
}

export type MoneyLeakAnalysisTransaction = {
  txn_id: string
  type: string
  category_id: string
  category: string
  amount: number
  transaction_date: string
}

export type UserAnalysisInput = FeatureEngineeringResult & {
  moneyLeakTransactions: MoneyLeakAnalysisTransaction[]
}
