import { predictionService } from '../predictions/prediction-service.ts'
import { transactionService } from '../transactions/transaction-service.ts'
import {
  buildInsights,
  buildWeekdayWeekendSummary,
  buildWeeklyTrend,
  calculateSavingRatePercent,
  mapMoneyLeaks,
  mapPredictionWarnings,
  normalizeDashboardPeriod,
} from './analytics-helpers.ts'
import { analyticsRepository } from './analytics-repository.ts'
import type { DashboardQueryDto } from './analytics-schema.ts'

export const analyticsService = {
  async getDashboard(userId: string, query: DashboardQueryDto) {
    const period = normalizeDashboardPeriod(query)
    const summary = await transactionService.summarize(userId, {
      from: period.from,
      to: period.to,
    })
    const [
      latestPrediction,
      recentTransactions,
      topCategories,
      expenseTransactions,
      moneyLeakCandidates,
    ] = await Promise.all([
      predictionService.getLatestOptional(userId),
      analyticsRepository.findRecentTransactions({ userId, ...period }, 3),
      analyticsRepository.findTopCategories({ userId, ...period }, 5),
      analyticsRepository.findExpenseTransactions({ userId, ...period }),
      analyticsRepository.findMoneyLeakCandidates({ userId, ...period }),
    ])
    const savingRatePercent = calculateSavingRatePercent(summary)
    const warnings = latestPrediction
      ? mapPredictionWarnings(latestPrediction.warnings)
      : []
    const moneyLeaks = mapMoneyLeaks(moneyLeakCandidates)

    return {
      period,
      summary: {
        ...summary,
        savingRatePercent,
      },
      persona: latestPrediction
        ? {
            id: latestPrediction.id,
            persona: latestPrediction.persona,
            confidence: latestPrediction.confidence,
            probabilities: latestPrediction.probabilities,
            transactionCount: latestPrediction.transactionCount,
            createdAt: latestPrediction.createdAt,
          }
        : null,
      recentTransactions,
      topCategories,
      trends: {
        weekly: buildWeeklyTrend(expenseTransactions, period),
        weekdayWeekend: buildWeekdayWeekendSummary(expenseTransactions, period),
      },
      warnings,
      moneyLeaks,
      insights: buildInsights({
        summary,
        savingRatePercent,
        topCategories,
        warnings,
        moneyLeaks,
      }),
    }
  },
}
