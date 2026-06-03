import { and, desc, eq, gte, lt, lte, sql, type SQL } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { categories } from '../../db/schemas/categories.ts'
import { transactions } from '../../db/schemas/transactions.ts'

export type AnalyticsPeriodFilters = {
  userId: string
  from: string
  to: string
}

export type DashboardRecentTransactionRecord = {
  id: string
  title: string
  merchantName: string | null
  paymentMethod: string | null
  type: string
  amountIdr: number
  signedAmountIdr: number
  transactionDate: Date
  category: {
    id: string
    name: string
    slug: string
    color: string | null
    icon: string | null
  }
}

export type TopCategoryRecord = {
  categoryId: string
  name: string
  slug: string
  color: string | null
  icon: string | null
  amountIdr: number
  percentage: number
  transactionCount: number
}

export type ExpenseTrendRecord = {
  id: string
  amountIdr: number
  transactionDate: Date
}

export type MoneyLeakCandidateRecord = {
  categoryId: string
  categoryName: string
  totalAmountIdr: number
  transactionCount: number
}

function getPeriodFilters(filters: AnalyticsPeriodFilters): SQL[] {
  return [
    eq(transactions.userId, filters.userId),
    gte(transactions.transactionDate, new Date(filters.from)),
    lte(transactions.transactionDate, new Date(filters.to)),
  ]
}

function getExpensePeriodFilters(filters: AnalyticsPeriodFilters): SQL[] {
  return [...getPeriodFilters(filters), eq(transactions.type, 'expense')]
}

export const analyticsRepository = {
  async findRecentTransactions(
    filters: AnalyticsPeriodFilters,
    limit: number,
  ): Promise<DashboardRecentTransactionRecord[]> {
    const conditions = getPeriodFilters(filters)

    const rows = await db
      .select({
        id: transactions.id,
        title: transactions.title,
        merchantName: transactions.merchantName,
        paymentMethod: transactions.paymentMethod,
        type: transactions.type,
        amountIdr: transactions.amountIdr,
        transactionDate: transactions.transactionDate,
        categoryId: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
        categoryColor: categories.color,
        categoryIcon: categories.icon,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
      .limit(limit)

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      merchantName: row.merchantName,
      paymentMethod: row.paymentMethod,
      type: row.type,
      amountIdr: row.amountIdr,
      signedAmountIdr: row.type === 'expense' ? -row.amountIdr : row.amountIdr,
      transactionDate: row.transactionDate,
      category: {
        id: row.categoryId,
        name: row.categoryName,
        slug: row.categorySlug,
        color: row.categoryColor,
        icon: row.categoryIcon,
      },
    }))
  },

  async findTopCategories(
    filters: AnalyticsPeriodFilters,
    limit: number,
  ): Promise<TopCategoryRecord[]> {
    const conditions = getExpensePeriodFilters(filters)
    const totalAmountExpression =
      sql<number>`sum(${transactions.amountIdr})`.mapWith(Number)
    const transactionCountExpression = sql<number>`count(*)`.mapWith(Number)

    const rows = await db
      .select({
        categoryId: categories.id,
        name: categories.name,
        slug: categories.slug,
        color: categories.color,
        icon: categories.icon,
        amountIdr: totalAmountExpression,
        transactionCount: transactionCountExpression,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))
      .groupBy(
        categories.id,
        categories.name,
        categories.slug,
        categories.color,
        categories.icon,
      )
      .orderBy(desc(totalAmountExpression))
      .limit(limit)

    const totalExpense = rows.reduce((total, row) => total + row.amountIdr, 0)

    return rows.map((row) => ({
      ...row,
      percentage:
        totalExpense === 0
          ? 0
          : Math.round((row.amountIdr / totalExpense) * 100),
    }))
  },

  async findExpenseTransactions(
    filters: AnalyticsPeriodFilters,
  ): Promise<ExpenseTrendRecord[]> {
    const conditions = getExpensePeriodFilters(filters)

    return await db
      .select({
        id: transactions.id,
        amountIdr: transactions.amountIdr,
        transactionDate: transactions.transactionDate,
      })
      .from(transactions)
      .where(and(...conditions))
      .orderBy(transactions.transactionDate, transactions.createdAt)
  },

  async findMoneyLeakCandidates(
    filters: AnalyticsPeriodFilters,
  ): Promise<MoneyLeakCandidateRecord[]> {
    const conditions = [
      ...getExpensePeriodFilters(filters),
      lt(transactions.amountIdr, 100_000),
    ]
    const totalAmountExpression =
      sql<number>`sum(${transactions.amountIdr})`.mapWith(Number)
    const transactionCountExpression = sql<number>`count(*)`.mapWith(Number)

    return await db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        totalAmountIdr: totalAmountExpression,
        transactionCount: transactionCountExpression,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))
      .groupBy(categories.id, categories.name)
      .having(sql`count(*) >= 10 and sum(${transactions.amountIdr}) > 500000`)
      .orderBy(desc(totalAmountExpression))
  },
}
