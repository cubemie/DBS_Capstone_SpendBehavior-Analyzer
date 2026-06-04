import * as z from 'zod'

export const categoryKindSchema = z.enum(['income', 'expense'])

export type CategoryKind = z.infer<typeof categoryKindSchema>
export type ListCategoriesQueryDto = z.infer<typeof listCategoriesQuerySchema>
export type CategoryResponseDto = z.infer<typeof categoryResponseSchema>

export const listCategoriesQuerySchema = z.object({
  kind: categoryKindSchema.optional(),
})

export const categoryResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  kind: categoryKindSchema,
  color: z.string().nullable(),
  icon: z.string().nullable(),
  isSystem: z.boolean(),
})
