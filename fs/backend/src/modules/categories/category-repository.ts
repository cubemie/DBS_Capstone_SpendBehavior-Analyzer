import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { categories } from '../../db/schemas/categories.ts'

export type CategoryRecord = typeof categories.$inferSelect

export const categoryRepository = {
  async findManySystem(kind?: string): Promise<CategoryRecord[]> {
    const filters = [isNull(categories.userId), eq(categories.isSystem, true)]

    if (kind) {
      filters.push(eq(categories.kind, kind))
    }

    return await db
      .select()
      .from(categories)
      .where(and(...filters))
      .orderBy(categories.kind, categories.name)
  },

  async findSystemById(id: string): Promise<CategoryRecord | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, id),
          isNull(categories.userId),
          eq(categories.isSystem, true),
        ),
      )

    return category
  },
}
