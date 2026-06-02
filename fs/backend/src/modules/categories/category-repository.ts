import { and, eq, isNotNull, isNull, or } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { categories } from '../../db/schemas/categories.ts'

export type CategoryRecord = typeof categories.$inferSelect

export type CreateCategoryRecord = {
  userId: string | null
  name: string
  slug: string
  kind: string
  mlKey?: string | null
  color?: string | null
  icon?: string | null
  isSystem?: boolean
}

export type UpdateCategoryRecord = {
  name?: string
  slug?: string
  color?: string | null
  icon?: string | null
  updatedAt: Date
}

export const categoryRepository = {
  async findManyForUser(
    userId: string,
    kind?: string,
  ): Promise<CategoryRecord[]> {
    const filters = [
      or(isNull(categories.userId), eq(categories.userId, userId)),
    ]

    if (kind) {
      filters.push(eq(categories.kind, kind))
    }

    return await db
      .select()
      .from(categories)
      .where(and(...filters))
      .orderBy(categories.kind, categories.name)
  },

  async findVisibleById(
    id: string,
    userId: string,
  ): Promise<CategoryRecord | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, id),
          or(isNull(categories.userId), eq(categories.userId, userId)),
        ),
      )

    return category
  },

  async findOwnedById(
    id: string,
    userId: string,
  ): Promise<CategoryRecord | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))

    return category
  },

  async findUserDuplicate(
    userId: string,
    kind: string,
    slug: string,
  ): Promise<CategoryRecord | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.userId, userId),
          eq(categories.kind, kind),
          eq(categories.slug, slug),
          isNotNull(categories.userId),
        ),
      )

    return category
  },

  async create(record: CreateCategoryRecord): Promise<CategoryRecord> {
    const [category] = await db.insert(categories).values(record).returning()

    return category
  },

  async update(
    id: string,
    record: UpdateCategoryRecord,
  ): Promise<CategoryRecord | undefined> {
    const [category] = await db
      .update(categories)
      .set(record)
      .where(eq(categories.id, id))
      .returning()

    return category
  },

  async delete(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id))
  },
}
