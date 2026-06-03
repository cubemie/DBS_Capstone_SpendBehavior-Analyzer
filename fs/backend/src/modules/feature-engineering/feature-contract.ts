export const FEATURE_ORDER = [
  'avg_txn_idr',
  'txn_count',
  'weekend_ratio',
  'night_ratio',
  'above_avg_ratio',
  'spike_ratio',
  'impulse_score',
  'unique_categories',
  'spending_cov',
  'cat_makanan_minuman_ratio',
  'cat_transportasi_ratio',
  'cat_kesehatan_kecantik_ratio',
  'cat_sembako_kebutuhan__ratio',
  'cat_kesehatan_ratio',
  'cat_pendidikan_ratio',
  'cat_belanja_online_ratio',
  'cat_pulsa_data_ratio',
  'cat_hiburan_ratio',
  'cat_fashion_pakaian_ratio',
] as const

export type FeatureName = (typeof FEATURE_ORDER)[number]
export type FeatureValues = Record<FeatureName, number>
export type FeatureVector = number[]

export function isFeatureName(value: string): value is FeatureName {
  return FEATURE_ORDER.some((featureName) => featureName === value)
}

export function buildFeatureVector(features: FeatureValues): FeatureVector {
  return FEATURE_ORDER.map((featureName) => features[featureName])
}

export function assertFeatureOrderMatches(
  featureOrder: readonly string[],
): void {
  const matches =
    featureOrder.length === FEATURE_ORDER.length &&
    featureOrder.every(
      (featureName, index) => featureName === FEATURE_ORDER[index],
    )

  if (!matches) {
    throw new Error('Backend feature order does not match ML feature order')
  }
}
