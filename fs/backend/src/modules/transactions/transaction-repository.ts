import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  sql,
  type SQL,
} from 'drizzle-orm'
import { getTableColumns } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { categories } from '../../db/schemas/categories.ts'
import { transactions } from '../../db/schemas/transactions.ts'
import type { CategoryRecord } from '../categories/category-repository.ts'

export type TransactionRecord = typeof transactions.$inferSelect
export type TransactionListItem = TransactionRecord & {
  category: CategoryRecord
}

export type TransactionSummary = {
  incomeTotalIdr: number
  expenseTotalIdr: number
  netTotalIdr: number
  transactionCount: number
}

export type CreateTransactionRecord = {
  userId: string
  categoryId: string
  title: string
  merchantName?: string | null
  paymentMethod?: string | null
  type: string
  amountIdr: number
  transactionDate: Date
  notes?: string | null
  source?: string
}

export type UpdateTransactionRecord = Partial<
  Omit<CreateTransactionRecord, 'userId' | 'source'>
> & {
  updatedAt: Date
}

export type ListTransactionFilters = {
  userId: string
  page: number
  limit: number
  from?: string
  to?: string
  categoryId?: string
  type?: string
  search?: string
  sort: 'date_desc' | 'date_asc'
}

export type TransactionSummaryFilters = {
  userId: string
  from?: string
  to?: string
}

function getBaseFilters(userId: string): SQL[] {
  return [eq(transactions.userId, userId)]
}

function addDateRangeFilters(filters: SQL[], from?: string, to?: string): void {
  if (from) {
    filters.push(gte(transactions.transactionDate, new Date(from)))
  }

  if (to) {
    filters.push(lte(transactions.transactionDate, new Date(to)))
  }
}

const transactionSelection = {
  ...getTableColumns(transactions),
  category: getTableColumns(categories),
}

export const transactionRepository = {
  async findMany(
    filters: ListTransactionFilters,
  ): Promise<{ items: TransactionListItem[]; total: number }> {
    const conditions = getBaseFilters(filters.userId)
    addDateRangeFilters(conditions, filters.from, filters.to)

    if (filters.categoryId) {
      conditions.push(eq(transactions.categoryId, filters.categoryId))
    }

    if (filters.type) {
      conditions.push(eq(transactions.type, filters.type))
    }

    if (filters.search) {
      const search = `%${filters.search}%`
      const searchCondition = or(
        ilike(transactions.title, search),
        ilike(transactions.merchantName, search),
        ilike(transactions.notes, search),
      )

      if (searchCondition) {
        conditions.push(searchCondition)
      }
    }

    const where = and(...conditions)
    const order =
      filters.sort === 'date_asc'
        ? asc(transactions.transactionDate)
        : desc(transactions.transactionDate)

    const items = await db
      .select(transactionSelection)
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(where)
      .orderBy(order, desc(transactions.createdAt))
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit)

    const [countRow] = await db
      .select({
        total: sql<number>`count(*)`.mapWith(Number),
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(where)

    return {
      items,
      total: countRow?.total ?? 0,
    }
  },

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<TransactionListItem | undefined> {
    const [transaction] = await db
      .select(transactionSelection)
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))

    return transaction
  },

  async create(record: CreateTransactionRecord): Promise<TransactionRecord> {
    const [transaction] = await db
      .insert(transactions)
      .values(record)
      .returning()

    return transaction
  },

  async update(
    id: string,
    userId: string,
    record: UpdateTransactionRecord,
  ): Promise<TransactionRecord | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set(record)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning()

    return transaction
  },

  async delete(id: string, userId: string): Promise<void> {
    await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
  },

  async summarize(
    filters: TransactionSummaryFilters,
  ): Promise<TransactionSummary> {
    const conditions = getBaseFilters(filters.userId)
    addDateRangeFilters(conditions, filters.from, filters.to)

    const [summary] = await db
      .select({
        incomeTotalIdr:
          sql<number>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amountIdr} else 0 end), 0)`.mapWith(
            Number,
          ),
        expenseTotalIdr:
          sql<number>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amountIdr} else 0 end), 0)`.mapWith(
            Number,
          ),
        transactionCount: sql<number>`count(*)`.mapWith(Number),
      })
      .from(transactions)
      .where(and(...conditions))

    const incomeTotalIdr = summary?.incomeTotalIdr ?? 0
    const expenseTotalIdr = summary?.expenseTotalIdr ?? 0

    return {
      incomeTotalIdr,
      expenseTotalIdr,
      netTotalIdr: incomeTotalIdr - expenseTotalIdr,
      transactionCount: summary?.transactionCount ?? 0,
    }
  },
}
