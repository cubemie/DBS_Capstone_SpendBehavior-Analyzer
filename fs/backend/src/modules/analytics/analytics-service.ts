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
      predictionStatus,
      recentTransactions,
      topCategories,
      expenseTransactions,
    ] = await Promise.all([
      predictionService.getDashboardPredictionStatus(userId, period),
      analyticsRepository.findRecentTransactions({ userId, ...period }, 3),
      analyticsRepository.findTopCategories({ userId, ...period }, 5),
      analyticsRepository.findExpenseTransactions({ userId, ...period }),
    ])
    const periodPrediction = predictionStatus.prediction
    const savingRatePercent = calculateSavingRatePercent(summary)
    const warnings = periodPrediction
      ? mapPredictionWarnings(periodPrediction.warnings)
      : []
    const moneyLeaks = mapMoneyLeaks(
      periodPrediction?.mlResponse.money_leaks ?? [],
    )

    return {
      period,
      summary: {
        ...summary,
        savingRatePercent,
      },
      persona: periodPrediction
        ? {
            id: periodPrediction.id,
            persona: periodPrediction.persona,
            confidence: periodPrediction.confidence,
            probabilities: periodPrediction.probabilities,
            transactionCount: periodPrediction.transactionCount,
            createdAt: periodPrediction.createdAt,
            predictionSource: predictionStatus.predictionSource,
          }
        : null,
      predictionStatus: {
        state: predictionStatus.state,
        transactionCount: predictionStatus.transactionCount,
        lastPredictedAt: predictionStatus.lastPredictedAt,
        predictionSource: predictionStatus.predictionSource,
      },
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
