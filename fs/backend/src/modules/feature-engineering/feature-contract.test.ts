import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  assertBackendFeatureOrderMatchesMlContract,
  FEATURE_ORDER,
  readMlFeatureOrder,
} from './feature-contract.ts'

test('backend feature order matches the ML service contract', () => {
  assert.deepEqual(FEATURE_ORDER, readMlFeatureOrder())
  assert.doesNotThrow(() => {
    assertBackendFeatureOrderMatchesMlContract()
  })
})
