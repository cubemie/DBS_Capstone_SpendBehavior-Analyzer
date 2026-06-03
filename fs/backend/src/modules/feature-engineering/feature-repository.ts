import { and, asc, eq, gte, lte, type SQL } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { categories } from '../../db/schemas/categories.ts'
import { transactions } from '../../db/schemas/transactions.ts'

export type FeatureTransactionRecord = {
  id: string
  amountIdr: number
  transactionDate: Date
  createdAt: Date
  categoryId: string
  categorySlug: string
  categoryMlKey: string | null
}

export type FeatureTransactionFilters = {
  userId: string
  from?: string
  to?: string
}

function addDateRangeFilters(filters: SQL[], from?: string, to?: string): void {
  if (from) {
    filters.push(gte(transactions.transactionDate, new Date(from)))
  }

  if (to) {
    filters.push(lte(transactions.transactionDate, new Date(to)))
  }
}

export const featureRepository = {
  async findExpenseTransactions(
    filters: FeatureTransactionFilters,
  ): Promise<FeatureTransactionRecord[]> {
    const conditions = [
      eq(transactions.userId, filters.userId),
      eq(transactions.type, 'expense'),
    ]
    addDateRangeFilters(conditions, filters.from, filters.to)

    return await db
      .select({
        id: transactions.id,
        amountIdr: transactions.amountIdr,
        transactionDate: transactions.transactionDate,
        createdAt: transactions.createdAt,
        categoryId: transactions.categoryId,
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
