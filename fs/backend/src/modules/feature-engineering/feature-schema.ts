import * as z from 'zod'
import type {
  FeatureName,
  FeatureValues,
  FeatureVector,
} from './feature-contract.ts'

const dateRangeSchema = z
  .object({
    from: z.iso.datetime({ offset: true }).optional(),
    to: z.iso.datetime({ offset: true }).optional(),
  })
  .refine(
    (value) => {
      if (!value.from || !value.to) {
        return true
      }

      return new Date(value.from).getTime() <= new Date(value.to).getTime()
    },
    {
      message: 'Tanggal awal tidak boleh setelah tanggal akhir',
      path: ['from'],
    },
  )

export const buildFeaturesOptionsSchema = dateRangeSchema.extend({
  timezone: z.string().trim().min(1).default('Asia/Jakarta'),
})

export type BuildFeaturesOptionsDto = z.input<typeof buildFeaturesOptionsSchema>

export type NormalizedBuildFeaturesOptions = z.output<
  typeof buildFeaturesOptionsSchema
>

export type FeatureEngineeringResult = {
  featureOrder: readonly FeatureName[]
  featuresByName: FeatureValues
  featureVector: FeatureVector
  transactionCount: number
  period: {
    from?: string
    to?: string
  }
}
