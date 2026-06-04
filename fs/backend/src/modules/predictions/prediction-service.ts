import { createHash } from 'node:crypto'
import { AppException } from '../../exception.ts'
import { assertFeatureOrderMatches } from '../feature-engineering/feature-contract.ts'
import { featureEngineeringService } from '../feature-engineering/feature-service.ts'
import { mlClient } from './ml-client.ts'
import {
  predictionRepository,
  type PredictionRecord,
} from './prediction-repository.ts'
import type {
  CreatePersonaPredictionDto,
  PredictionHistoryQueryDto,
  PredictionHistoryResponseDto,
  PredictionResultResponseDto,
} from './prediction-schema.ts'

type FeatureHashInput = {
  featureOrder: readonly string[]
  featureVector: readonly number[]
  period: {
    from?: string
    to?: string
  }
  timezone: string
}

type PredictionPeriodInput = {
  from?: string
  to?: string
  timezone: string
}

export type DashboardPredictionSelection = {
  prediction: PredictionRecord
  source: 'period' | 'latest'
}

export type DashboardPredictionStatusState =
  | 'empty'
  | 'missing'
  | 'stale'
  | 'fresh'

export type DashboardPredictionStatus = {
  state: DashboardPredictionStatusState
  transactionCount: number
  lastPredictedAt?: Date
  predictionSource: 'period' | null
  prediction: PredictionRecord | null
}

function normalizeHashPeriod(period: FeatureHashInput['period']): {
  from?: string
  to?: string
} {
  return {
    from: period.from ? new Date(period.from).toISOString() : undefined,
    to: period.to ? new Date(period.to).toISOString() : undefined,
  }
}

export function createFeatureVectorHash(input: FeatureHashInput): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        ...input,
        period: normalizeHashPeriod(input.period),
      }),
    )
    .digest('hex')
}

export const predictionService = {
  async createPersonaPrediction(
    userId: string,
    dto: CreatePersonaPredictionDto,
  ): Promise<PredictionResultResponseDto> {
    const featureResult = await featureEngineeringService.buildForUser(userId, {
      from: dto.from,
      to: dto.to,
      timezone: dto.timezone,
    })

    if (featureResult.transactionCount === 0) {
      throw new AppException(
        'Belum ada transaksi pengeluaran untuk periode ini',
        422,
      )
    }

    assertFeatureOrderMatches(featureResult.featureOrder)

    const featureVectorHash = createFeatureVectorHash({
      featureOrder: featureResult.featureOrder,
      featureVector: featureResult.featureVector,
      period: featureResult.period,
      timezone: dto.timezone,
    })

    if (!dto.force) {
      const cachedPrediction =
        await predictionRepository.findLatestByFeatureHash(
          userId,
          featureVectorHash,
        )

      if (cachedPrediction) {
        return {
          ...cachedPrediction,
          cached: true,
        }
      }
    }

    const mlResponse = await mlClient.predict(featureResult.featureVector)
    const prediction = await predictionRepository.create({
      userId,
      periodFrom: dto.from ? new Date(dto.from) : null,
      periodTo: dto.to ? new Date(dto.to) : null,
      timezone: dto.timezone,
      persona: mlResponse.persona,
      confidence: mlResponse.confidence,
      probabilities: mlResponse.probabilities,
      warnings: mlResponse.smart_warnings_system,
      featureOrder: Array.from(featureResult.featureOrder),
      features: featureResult.featuresByName,
      featureVectorHash,
      transactionCount: featureResult.transactionCount,
      mlResponse,
    })

    return {
      ...prediction,
      cached: false,
    }
  },

  async getLatest(userId: string): Promise<PredictionRecord> {
    const prediction = await predictionRepository.findLatest(userId)
    if (!prediction) {
      throw new AppException('Prediksi belum tersedia', 404)
    }

    return prediction
  },

  async getLatestOptional(userId: string): Promise<PredictionRecord | null> {
    return (await predictionRepository.findLatest(userId)) ?? null
  },

  async getLatestForPeriodOptional(
    userId: string,
    period: PredictionPeriodInput,
  ): Promise<PredictionRecord | null> {
    return (
      (await predictionRepository.findLatestForPeriod({
        userId,
        from: period.from,
        to: period.to,
        timezone: period.timezone,
      })) ?? null
    )
  },

  async getDashboardPredictionOptional(
    userId: string,
    period: PredictionPeriodInput,
  ): Promise<DashboardPredictionSelection | null> {
    const periodPrediction = await this.getLatestForPeriodOptional(userId, period)
    if (periodPrediction) {
      return {
        prediction: periodPrediction,
        source: 'period',
      }
    }

    const latestPrediction = await this.getLatestOptional(userId)
    if (!latestPrediction) {
      return null
    }

    return {
      prediction: latestPrediction,
      source: 'latest',
    }
  },

  async getDashboardPredictionStatus(
    userId: string,
    period: PredictionPeriodInput,
  ): Promise<DashboardPredictionStatus> {
    const featureResult = await featureEngineeringService.buildForUser(userId, {
      from: period.from,
      to: period.to,
      timezone: period.timezone,
    })
    const prediction = await this.getLatestForPeriodOptional(userId, period)

    if (featureResult.transactionCount === 0) {
      return {
        state: 'empty',
        transactionCount: 0,
        predictionSource: null,
        prediction: null,
      }
    }

    if (!prediction) {
      return {
        state: 'missing',
        transactionCount: featureResult.transactionCount,
        predictionSource: null,
        prediction: null,
      }
    }

    const currentFeatureVectorHash = createFeatureVectorHash({
      featureOrder: featureResult.featureOrder,
      featureVector: featureResult.featureVector,
      period: featureResult.period,
      timezone: period.timezone,
    })
    const state =
      prediction.featureVectorHash === currentFeatureVectorHash
        ? 'fresh'
        : 'stale'

    return {
      state,
      transactionCount: featureResult.transactionCount,
      lastPredictedAt: prediction.createdAt,
      predictionSource: 'period',
      prediction,
    }
  },

  async listHistory(
    userId: string,
    query: PredictionHistoryQueryDto,
  ): Promise<PredictionHistoryResponseDto> {
    const result = await predictionRepository.findMany({
      userId,
      page: query.page,
      limit: query.limit,
      from: query.from,
      to: query.to,
    })

    return {
      ...result,
      page: query.page,
      limit: query.limit,
    }
  },
}
