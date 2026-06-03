import { featureRepository } from './feature-repository.ts'
import { calculateFeatures } from './feature-calculator.ts'
import {
  buildFeaturesOptionsSchema,
  type BuildFeaturesOptionsDto,
  type FeatureEngineeringResult,
} from './feature-schema.ts'

export const featureEngineeringService = {
  async buildForUser(
    userId: string,
    options: BuildFeaturesOptionsDto = {},
  ): Promise<FeatureEngineeringResult> {
    const normalizedOptions = buildFeaturesOptionsSchema.parse(options)
    const transactions = await featureRepository.findExpenseTransactions({
      userId,
      from: normalizedOptions.from,
      to: normalizedOptions.to,
    })

    return calculateFeatures(transactions, normalizedOptions)
  },
}
