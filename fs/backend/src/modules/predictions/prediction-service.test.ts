import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import type { PredictionRecord } from './prediction-repository.ts'
import { featureEngineeringService } from '../feature-engineering/feature-service.ts'
import type { UserAnalysisInput } from '../feature-engineering/feature-schema.ts'
import { predictionRepository } from './prediction-repository.ts'
import {
  createFeatureVectorHash,
  predictionService,
} from './prediction-service.ts'

type FindLatestForPeriod = typeof predictionRepository.findLatestForPeriod
type FindLatest = typeof predictionRepository.findLatest

const originalFindLatestForPeriod = predictionRepository.findLatestForPeriod
const originalFindLatest = predictionRepository.findLatest
const originalBuildAnalysisInputForUser =
  featureEngineeringService.buildAnalysisInputForUser

const stableWarning = {
  code: 'spending_stable',
  title: 'Pola Pengeluaran Stabil',
  message: 'Pola pengeluaran stabil, tidak ada anomali terdeteksi.',
  label: 'Aman',
  severity: 'success',
} as const

function createPredictionRecord(
  overrides: Partial<PredictionRecord> = {},
): PredictionRecord {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    userId: '22222222-2222-2222-2222-222222222222',
    periodFrom: new Date('2026-06-01T00:00:00.000Z'),
    periodTo: new Date('2026-06-30T23:59:59.000Z'),
    timezone: 'Asia/Jakarta',
    persona: 'Rational Spender',
    confidence: 0.9,
    probabilities: {
      emotional: 0.05,
      impulsive: 0.05,
      rational: 0.9,
    },
    warnings: [stableWarning],
    featureOrder: ['avg_txn_idr'],
    features: {
      avg_txn_idr: 100_000,
    },
    featureVectorHash: 'feature-vector-hash',
    transactionCount: 10,
    mlResponse: {
      persona: 'Rational Spender',
      confidence: 0.9,
      probabilities: {
        emotional: 0.05,
        impulsive: 0.05,
        rational: 0.9,
      },
      smart_warnings_system: [stableWarning],
      money_leaks: [],
    },
    createdAt: new Date('2026-06-30T23:59:59.000Z'),
    ...overrides,
  }
}

afterEach(() => {
  predictionRepository.findLatestForPeriod = originalFindLatestForPeriod
  predictionRepository.findLatest = originalFindLatest
  featureEngineeringService.buildAnalysisInputForUser =
    originalBuildAnalysisInputForUser
})

function createAnalysisResult(
  overrides: Partial<UserAnalysisInput> = {},
): UserAnalysisInput {
  return {
    featureOrder: ['avg_txn_idr'],
    featuresByName: {
      avg_txn_idr: 100_000,
    },
    featureVector: [100_000],
    transactionCount: 10,
    period: {
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-30T23:59:59.000Z',
    },
    moneyLeakTransactions: [
      {
        txn_id: '66666666-6666-6666-6666-666666666666',
        type: 'expense',
        category_id: '77777777-7777-7777-7777-777777777777',
        category: 'Makanan & Minuman',
        amount: 50_000,
        transaction_date: '2026-06-10T12:00:00.000Z',
      },
    ],
    ...overrides,
  } as UserAnalysisInput
}

test('dashboard prediction selection prefers an exact period prediction', async () => {
  const periodPrediction = createPredictionRecord({
    id: '33333333-3333-3333-3333-333333333333',
  })
  const latestPrediction = createPredictionRecord({
    id: '44444444-4444-4444-4444-444444444444',
  })
  let latestWasCalled = false

  predictionRepository.findLatestForPeriod = (async () =>
    periodPrediction) satisfies FindLatestForPeriod
  predictionRepository.findLatest = (async () => {
    latestWasCalled = true

    return latestPrediction
  }) satisfies FindLatest

  const selection = await predictionService.getDashboardPredictionOptional(
    periodPrediction.userId,
    {
      from: periodPrediction.periodFrom?.toISOString(),
      to: periodPrediction.periodTo?.toISOString(),
      timezone: periodPrediction.timezone,
    },
  )

  assert.equal(selection?.source, 'period')
  assert.equal(selection?.prediction.id, periodPrediction.id)
  assert.equal(latestWasCalled, false)
})

test('dashboard prediction selection falls back to latest prediction', async () => {
  const latestPrediction = createPredictionRecord({
    id: '55555555-5555-5555-5555-555555555555',
  })

  predictionRepository.findLatestForPeriod = (async () =>
    undefined) satisfies FindLatestForPeriod
  predictionRepository.findLatest = (async () =>
    latestPrediction) satisfies FindLatest

  const selection = await predictionService.getDashboardPredictionOptional(
    latestPrediction.userId,
    {
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-30T23:59:59.000Z',
      timezone: latestPrediction.timezone,
    },
  )

  assert.equal(selection?.source, 'latest')
  assert.equal(selection?.prediction.id, latestPrediction.id)
})

test('dashboard prediction selection returns null when no prediction exists', async () => {
  predictionRepository.findLatestForPeriod = (async () =>
    undefined) satisfies FindLatestForPeriod
  predictionRepository.findLatest = (async () => undefined) satisfies FindLatest

  const selection = await predictionService.getDashboardPredictionOptional(
    '22222222-2222-2222-2222-222222222222',
    {
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-30T23:59:59.000Z',
      timezone: 'Asia/Jakarta',
    },
  )

  assert.equal(selection, null)
})

test('dashboard prediction status is empty when current period has no expense transactions', async () => {
  featureEngineeringService.buildAnalysisInputForUser = (async () =>
    createAnalysisResult({
      featureVector: [0],
      transactionCount: 0,
      moneyLeakTransactions: [],
    })) satisfies typeof featureEngineeringService.buildAnalysisInputForUser
  predictionRepository.findLatestForPeriod = (async () =>
    createPredictionRecord()) satisfies FindLatestForPeriod

  const status = await predictionService.getDashboardPredictionStatus(
    '22222222-2222-2222-2222-222222222222',
    {
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-30T23:59:59.000Z',
      timezone: 'Asia/Jakarta',
    },
  )

  assert.equal(status.state, 'empty')
  assert.equal(status.prediction, null)
  assert.equal(status.transactionCount, 0)
})

test('dashboard prediction status is missing when current period has no exact prediction', async () => {
  featureEngineeringService.buildAnalysisInputForUser = (async () =>
    createAnalysisResult()) satisfies typeof featureEngineeringService.buildAnalysisInputForUser
  predictionRepository.findLatestForPeriod = (async () =>
    undefined) satisfies FindLatestForPeriod

  const status = await predictionService.getDashboardPredictionStatus(
    '22222222-2222-2222-2222-222222222222',
    {
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-30T23:59:59.000Z',
      timezone: 'Asia/Jakarta',
    },
  )

  assert.equal(status.state, 'missing')
  assert.equal(status.prediction, null)
  assert.equal(status.transactionCount, 10)
})

test('dashboard prediction status is fresh when feature hash matches exact prediction', async () => {
  const featureResult = createAnalysisResult()
  const featureVectorHash = createFeatureVectorHash({
    featureOrder: featureResult.featureOrder,
    featureVector: featureResult.featureVector,
    moneyLeakTransactions: featureResult.moneyLeakTransactions,
    period: featureResult.period,
    timezone: 'Asia/Jakarta',
  })
  const prediction = createPredictionRecord({ featureVectorHash })

  featureEngineeringService.buildAnalysisInputForUser = (async () =>
    featureResult) satisfies typeof featureEngineeringService.buildAnalysisInputForUser
  predictionRepository.findLatestForPeriod = (async () =>
    prediction) satisfies FindLatestForPeriod

  const status = await predictionService.getDashboardPredictionStatus(
    prediction.userId,
    {
      from: '2026-06-01T07:00:00.000+07:00',
      to: '2026-07-01T06:59:59.000+07:00',
      timezone: 'Asia/Jakarta',
    },
  )

  assert.equal(status.state, 'fresh')
  assert.equal(status.prediction?.id, prediction.id)
  assert.equal(status.predictionSource, 'period')
})

test('dashboard prediction status is stale when feature hash changed', async () => {
  featureEngineeringService.buildAnalysisInputForUser = (async () =>
    createAnalysisResult()) satisfies typeof featureEngineeringService.buildAnalysisInputForUser
  predictionRepository.findLatestForPeriod = (async () =>
    createPredictionRecord({
      featureVectorHash: 'old-feature-vector-hash',
    })) satisfies FindLatestForPeriod

  const status = await predictionService.getDashboardPredictionStatus(
    '22222222-2222-2222-2222-222222222222',
    {
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-30T23:59:59.000Z',
      timezone: 'Asia/Jakarta',
    },
  )

  assert.equal(status.state, 'stale')
  assert.equal(status.predictionSource, 'period')
})

test('dashboard prediction status is stale when money leak transaction evidence changed', async () => {
  const featureResult = createAnalysisResult()
  const featureVectorHash = createFeatureVectorHash({
    featureOrder: featureResult.featureOrder,
    featureVector: featureResult.featureVector,
    moneyLeakTransactions: [],
    period: featureResult.period,
    timezone: 'Asia/Jakarta',
  })

  featureEngineeringService.buildAnalysisInputForUser = (async () =>
    featureResult) satisfies typeof featureEngineeringService.buildAnalysisInputForUser
  predictionRepository.findLatestForPeriod = (async () =>
    createPredictionRecord({
      featureVectorHash,
    })) satisfies FindLatestForPeriod

  const status = await predictionService.getDashboardPredictionStatus(
    '22222222-2222-2222-2222-222222222222',
    {
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-30T23:59:59.000Z',
      timezone: 'Asia/Jakarta',
    },
  )

  assert.equal(status.state, 'stale')
})
