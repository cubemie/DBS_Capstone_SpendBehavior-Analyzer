import { AppException } from '../exception.ts'
import { categoryRepository } from '../repositories/category-repository.ts'
import {
  transactionRepository,
  type TransactionListItem,
  type TransactionSummary,
} from '../repositories/transaction-repository.ts'
import type {
  CreateTransactionDto,
  ListTransactionsQueryDto,
  UpdateTransactionDto,
} from '../schemas/transaction-schema.ts'

function createDate(value: string): Date {
  return new Date(value)
}

async function assertCategoryCanBeUsed(
  userId: string,
  categoryId: string,
  type: string,
): Promise<void> {
  const category = await categoryRepository.findVisibleById(categoryId, userId)

  if (!category) {
    throw new AppException('Kategori tidak ditemukan', 404)
  }

  if (category.kind !== type) {
    throw new AppException('Tipe transaksi tidak sesuai kategori', 422)
  }
}

export const transactionService = {
  async list(
    userId: string,
    query: ListTransactionsQueryDto,
  ): Promise<{
    items: TransactionListItem[]
    page: number
    limit: number
    total: number
  }> {
    const result = await transactionRepository.findMany({
      userId,
      page: query.page,
      limit: query.limit,
      from: query.from,
      to: query.to,
      categoryId: query.categoryId,
      type: query.type,
      search: query.search,
      sort: query.sort,
    })

    return {
      ...result,
      page: query.page,
      limit: query.limit,
    }
  },

  async getById(userId: string, id: string): Promise<TransactionListItem> {
    const transaction = await transactionRepository.findByIdForUser(id, userId)
    if (!transaction) {
      throw new AppException('Transaksi tidak ditemukan', 404)
    }

    return transaction
  },

  async create(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<TransactionListItem> {
    await assertCategoryCanBeUsed(userId, dto.categoryId, dto.type)

    const transaction = await transactionRepository.create({
      userId,
      categoryId: dto.categoryId,
      title: dto.title,
      merchantName: dto.merchantName,
      paymentMethod: dto.paymentMethod,
      type: dto.type,
      amountIdr: dto.amountIdr,
      transactionDate: createDate(dto.transactionDate),
      notes: dto.notes,
      source: 'manual',
    })

    return await this.getById(userId, transaction.id)
  },

  async update(
    userId: string,
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<TransactionListItem> {
    const existing = await transactionRepository.findByIdForUser(id, userId)
    if (!existing) {
      throw new AppException('Transaksi tidak ditemukan', 404)
    }

    const nextCategoryId = dto.categoryId ?? existing.categoryId
    const nextType = dto.type ?? existing.type
    await assertCategoryCanBeUsed(userId, nextCategoryId, nextType)

    await transactionRepository.update(id, userId, {
      categoryId: dto.categoryId,
      title: dto.title,
      merchantName: dto.merchantName,
      paymentMethod: dto.paymentMethod,
      type: dto.type,
      amountIdr: dto.amountIdr,
      transactionDate: dto.transactionDate
        ? createDate(dto.transactionDate)
        : undefined,
      notes: dto.notes,
      updatedAt: new Date(),
    })

    return await this.getById(userId, id)
  },

  async delete(userId: string, id: string): Promise<void> {
    await this.getById(userId, id)
    await transactionRepository.delete(id, userId)
  },

  async summarize(
    userId: string,
    query: { from?: string; to?: string },
  ): Promise<TransactionSummary> {
    return await transactionRepository.summarize({
      userId,
      from: query.from,
      to: query.to,
    })
  },
}
