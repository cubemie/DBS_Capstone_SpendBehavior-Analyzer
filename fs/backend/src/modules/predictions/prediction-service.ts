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

function createFeatureVectorHash(input: FeatureHashInput): string {
  return createHash('sha256').update(JSON.stringify(input)).digest('hex')
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
