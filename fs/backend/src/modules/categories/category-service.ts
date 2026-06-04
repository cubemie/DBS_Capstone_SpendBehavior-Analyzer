import {
  categoryRepository,
  type CategoryRecord,
} from './category-repository.ts'
import {
  categoryKindSchema,
  type CategoryResponseDto,
  type ListCategoriesQueryDto,
} from './category-schema.ts'

export function toCategoryResponse(
  category: CategoryRecord,
): CategoryResponseDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    kind: categoryKindSchema.parse(category.kind),
    color: category.color,
    icon: category.icon,
    isSystem: category.isSystem,
  }
}

export const categoryService = {
  async list(query: ListCategoriesQueryDto): Promise<CategoryResponseDto[]> {
    const categories = await categoryRepository.findManySystem(query.kind)

    return categories.map(toCategoryResponse)
  },
}
