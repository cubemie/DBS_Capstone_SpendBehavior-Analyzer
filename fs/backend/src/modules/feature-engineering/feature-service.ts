import { featureRepository } from './feature-repository.ts'
import { calculateFeatures } from './feature-calculator.ts'
import {
  buildFeaturesOptionsSchema,
  type BuildFeaturesOptionsDto,
  type FeatureEngineeringResult,
  type MoneyLeakAnalysisTransaction,
  type UserAnalysisInput,
} from './feature-schema.ts'

function toMoneyLeakAnalysisTransaction(
  transaction: Awaited<ReturnType<typeof featureRepository.findTransactions>>[number],
): MoneyLeakAnalysisTransaction {
  return {
    txn_id: transaction.id,
    type: transaction.type,
    category_id: transaction.categoryId,
    category: transaction.categoryName,
    amount: transaction.amountIdr,
    transaction_date: transaction.transactionDate.toISOString(),
  }
}

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

  async buildAnalysisInputForUser(
    userId: string,
    options: BuildFeaturesOptionsDto = {},
  ): Promise<UserAnalysisInput> {
    const normalizedOptions = buildFeaturesOptionsSchema.parse(options)
    const [expenseTransactions, transactions] = await Promise.all([
      featureRepository.findExpenseTransactions({
        userId,
        from: normalizedOptions.from,
        to: normalizedOptions.to,
      }),
      featureRepository.findTransactions({
        userId,
        from: normalizedOptions.from,
        to: normalizedOptions.to,
      }),
    ])
    const featureResult = calculateFeatures(
      expenseTransactions,
      normalizedOptions,
    )

    return {
      ...featureResult,
      moneyLeakTransactions: transactions.map(toMoneyLeakAnalysisTransaction),
    }
  },
}
