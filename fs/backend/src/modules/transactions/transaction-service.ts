import { AppException } from '../../exception.ts'
import { toCategoryResponse } from '../categories/category-service.ts'
import { categoryRepository } from '../categories/category-repository.ts'
import {
  transactionRepository,
  type TransactionListItem,
  type TransactionSummary,
} from './transaction-repository.ts'
import type {
  CreateTransactionDto,
  ListTransactionsQueryDto,
  UpdateTransactionDto,
} from './transaction-schema.ts'

export type TransactionResponse = Omit<TransactionListItem, 'category'> & {
  category: ReturnType<typeof toCategoryResponse>
}

function createDate(value: string): Date {
  return new Date(value)
}

async function assertCategoryCanBeUsed(
  categoryId: string,
  type: string,
): Promise<void> {
  const category = await categoryRepository.findSystemById(categoryId)

  if (!category) {
    throw new AppException('Kategori tidak ditemukan', 404)
  }

  if (category.kind !== type) {
    throw new AppException('Tipe transaksi tidak sesuai kategori', 422)
  }
}

function toTransactionResponse(
  transaction: TransactionListItem,
): TransactionResponse {
  return {
    ...transaction,
    category: toCategoryResponse(transaction.category),
  }
}

async function getTransactionById(
  userId: string,
  id: string,
): Promise<TransactionResponse> {
  const transaction = await transactionRepository.findByIdForUser(id, userId)
  if (!transaction) {
    throw new AppException('Transaksi tidak ditemukan', 404)
  }

  return toTransactionResponse(transaction)
}

export const transactionService = {
  async list(
    userId: string,
    query: ListTransactionsQueryDto,
  ): Promise<{
    items: TransactionResponse[]
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
      items: result.items.map(toTransactionResponse),
      total: result.total,
      page: query.page,
      limit: query.limit,
    }
  },

  async getById(userId: string, id: string): Promise<TransactionResponse> {
    return await getTransactionById(userId, id)
  },

  async create(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<TransactionResponse> {
    await assertCategoryCanBeUsed(dto.categoryId, dto.type)

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

    return await getTransactionById(userId, transaction.id)
  },

  async update(
    userId: string,
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<TransactionResponse> {
    const existing = await transactionRepository.findByIdForUser(id, userId)
    if (!existing) {
      throw new AppException('Transaksi tidak ditemukan', 404)
    }

    const nextCategoryId = dto.categoryId ?? existing.categoryId
    const nextType = dto.type ?? existing.type
    await assertCategoryCanBeUsed(nextCategoryId, nextType)

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

    return await getTransactionById(userId, id)
  },

  async delete(userId: string, id: string): Promise<void> {
    await getTransactionById(userId, id)
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
