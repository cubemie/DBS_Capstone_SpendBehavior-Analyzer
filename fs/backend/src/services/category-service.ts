import { AppException } from '../exception.ts'
import {
  categoryRepository,
  type CategoryRecord,
} from '../repositories/category-repository.ts'
import { transactionRepository } from '../repositories/transaction-repository.ts'
import type {
  CreateCategoryDto,
  ListCategoriesQueryDto,
  UpdateCategoryDto,
} from '../schemas/category-schema.ts'

function createSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function assertUniqueUserCategory(
  userId: string,
  kind: string,
  slug: string,
  currentId?: string,
): Promise<void> {
  const duplicate = await categoryRepository.findUserDuplicate(
    userId,
    kind,
    slug,
  )

  if (duplicate && duplicate.id !== currentId) {
    throw new AppException('Kategori sudah ada', 409)
  }
}

export const categoryService = {
  async list(
    userId: string,
    query: ListCategoriesQueryDto,
  ): Promise<CategoryRecord[]> {
    return await categoryRepository.findManyForUser(userId, query.kind)
  },

  async create(
    userId: string,
    dto: CreateCategoryDto,
  ): Promise<CategoryRecord> {
    const slug = createSlug(dto.name)
    await assertUniqueUserCategory(userId, dto.kind, slug)

    return await categoryRepository.create({
      userId,
      name: dto.name,
      slug,
      kind: dto.kind,
      color: dto.color,
      icon: dto.icon,
      isSystem: false,
    })
  },

  async update(
    userId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryRecord> {
    const category = await categoryRepository.findVisibleById(id, userId)
    if (!category) {
      throw new AppException('Kategori tidak ditemukan', 404)
    }

    if (category.isSystem || category.userId !== userId) {
      throw new AppException('Kategori sistem tidak dapat diubah', 403)
    }

    const slug = dto.name ? createSlug(dto.name) : undefined
    if (slug) {
      await assertUniqueUserCategory(userId, category.kind, slug, category.id)
    }

    const updatedCategory = await categoryRepository.update(category.id, {
      name: dto.name,
      slug,
      color: dto.color,
      icon: dto.icon,
      updatedAt: new Date(),
    })

    if (!updatedCategory) {
      throw new AppException('Kategori tidak ditemukan', 404)
    }

    return updatedCategory
  },

  async delete(userId: string, id: string): Promise<void> {
    const category = await categoryRepository.findVisibleById(id, userId)
    if (!category) {
      throw new AppException('Kategori tidak ditemukan', 404)
    }

    if (category.isSystem || category.userId !== userId) {
      throw new AppException('Kategori sistem tidak dapat dihapus', 403)
    }

    const isUsed = await transactionRepository.existsForCategory(
      category.id,
      userId,
    )
    if (isUsed) {
      throw new AppException('Kategori masih digunakan transaksi', 409)
    }

    await categoryRepository.delete(category.id)
  },
}
