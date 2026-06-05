import { and, asc, eq } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { categories } from '../../db/schemas/categories.ts'
import { transactions } from '../../db/schemas/transactions.ts'
import { addTimestampRangeFilters } from '../../utils/db-filters.ts'

export type FeatureTransactionRecord = {
  id: string
  type: string
  amountIdr: number
  transactionDate: Date
  createdAt: Date
  categoryId: string
  categoryName: string
  categorySlug: string
  categoryMlKey: string | null
}

export type FeatureTransactionFilters = {
  userId: string
  from?: string
  to?: string
}

export const featureRepository = {
  async findExpenseTransactions(
    filters: FeatureTransactionFilters,
  ): Promise<FeatureTransactionRecord[]> {
    const conditions = [
      eq(transactions.userId, filters.userId),
      eq(transactions.type, 'expense'),
    ]
    addTimestampRangeFilters(
      conditions,
      transactions.transactionDate,
      filters.from,
      filters.to,
    )

    return await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amountIdr: transactions.amountIdr,
        transactionDate: transactions.transactionDate,
        createdAt: transactions.createdAt,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        categoryMlKey: categories.mlKey,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(
        asc(transactions.transactionDate),
        asc(transactions.createdAt),
        asc(transactions.id),
      )
  },

  async findTransactions(
    filters: FeatureTransactionFilters,
  ): Promise<FeatureTransactionRecord[]> {
    const conditions = [eq(transactions.userId, filters.userId)]
    addTimestampRangeFilters(
      conditions,
      transactions.transactionDate,
      filters.from,
      filters.to,
    )

    return await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amountIdr: transactions.amountIdr,
        transactionDate: transactions.transactionDate,
        createdAt: transactions.createdAt,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        categoryMlKey: categories.mlKey,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(
        asc(transactions.transactionDate),
        asc(transactions.createdAt),
        asc(transactions.id),
      )
  },
}
