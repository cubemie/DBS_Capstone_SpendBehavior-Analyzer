import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mapPredictionWarnings } from './analytics-helpers.ts'
import type { PredictionStoredWarning } from '../../db/schemas/prediction-results.ts'

test('maps structured prediction warnings without inferring fields from text', () => {
  const warnings = mapPredictionWarnings([
    {
      code: 'weekend_spending_high',
      title: 'Pengeluaran Akhir Pekan Tinggi',
      message: 'Custom ML-owned weekend warning message.',
      label: 'Weekend',
      severity: 'warning',
    },
  ])

  assert.deepEqual(warnings, [
    {
      id: 'warning-1',
      code: 'weekend_spending_high',
      title: 'Pengeluaran Akhir Pekan Tinggi',
      description: 'Custom ML-owned weekend warning message.',
      label: 'Weekend',
      severity: 'warning',
      source: 'prediction',
    },
  ])
})

test('maps legacy string prediction warnings to a generic fallback', () => {
  const legacyWarnings: PredictionStoredWarning[] = [
    'Peringatan: Tingkat pengeluaran impulsif melewati ambang batas aman.',
  ]

  assert.deepEqual(mapPredictionWarnings(legacyWarnings), [
    {
      id: 'warning-1',
      title: 'Peringatan Pengeluaran',
      description:
        'Peringatan: Tingkat pengeluaran impulsif melewati ambang batas aman.',
      label: 'Sinyal',
      severity: 'info',
      source: 'prediction',
    },
  ])
})
