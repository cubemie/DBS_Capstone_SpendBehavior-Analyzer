import * as z from 'zod'
import type { CategoryRecord } from './category-repository.ts'

export const categoryKindSchema = z.enum(['income', 'expense'])

export type CategoryKind = z.infer<typeof categoryKindSchema>
export type CategoryResponseDto = CategoryRecord
export type CreateCategoryDto = z.infer<typeof createCategorySchema>
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>
export type ListCategoriesQueryDto = z.infer<typeof listCategoriesQuerySchema>

const optionalTextSchema = z
  .string('Harus merupakan string yang valid')
  .trim()
  .min(1)
  .max(64)
  .optional()
  .nullable()

export const listCategoriesQuerySchema = z.object({
  kind: categoryKindSchema.optional(),
})

export const createCategorySchema = z.object({
  name: z.string('Harus merupakan string yang valid').trim().min(1).max(80),
  kind: categoryKindSchema,
  color: optionalTextSchema,
  icon: optionalTextSchema,
})

export const updateCategorySchema = z
  .object({
    name: z
      .string('Harus merupakan string yang valid')
      .trim()
      .min(1)
      .max(80)
      .optional(),
    color: optionalTextSchema,
    icon: optionalTextSchema,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Minimal satu field harus diisi',
  })

export const categoryParamsSchema = z.object({
  id: z.uuid('Harus merupakan format UUID yang valid'),
})
