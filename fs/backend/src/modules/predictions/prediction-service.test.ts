import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import type { PredictionRecord } from './prediction-repository.ts'
import { predictionRepository } from './prediction-repository.ts'
import { predictionService } from './prediction-service.ts'

type FindLatestForPeriod = typeof predictionRepository.findLatestForPeriod
type FindLatest = typeof predictionRepository.findLatest

const originalFindLatestForPeriod = predictionRepository.findLatestForPeriod
const originalFindLatest = predictionRepository.findLatest

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
    warnings: ['Pola pengeluaran stabil'],
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
      smart_warnings_system: ['Pola pengeluaran stabil'],
    },
    createdAt: new Date('2026-06-30T23:59:59.000Z'),
    ...overrides,
  }
}

afterEach(() => {
  predictionRepository.findLatestForPeriod = originalFindLatestForPeriod
  predictionRepository.findLatest = originalFindLatest
})

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
