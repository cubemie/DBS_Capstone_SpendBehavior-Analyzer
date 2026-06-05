import type { Request, Response } from 'express'
import { getAuthPayload } from '../../utils/auth-request.ts'
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
  transactionParamsSchema,
  transactionSummaryQuerySchema,
  updateTransactionSchema,
} from './transaction-schema.ts'
import { sendData } from '../../utils/response.ts'
import { transactionService } from './transaction-service.ts'

export const transactionController = {
  async list(req: Request, res: Response) {
    const userId = getAuthPayload(req).sub
    const query = listTransactionsQuerySchema.parse(req.query)
    const transactions = await transactionService.list(userId, query)

    sendData(res, transactions)
  },

  async create(req: Request, res: Response) {
    const userId = getAuthPayload(req).sub
    const payload = createTransactionSchema.parse(req.body)
    const transaction = await transactionService.create(userId, payload)

    sendData(res, transaction, 201)
  },

  async getById(req: Request, res: Response) {
    const userId = getAuthPayload(req).sub
    const { id } = transactionParamsSchema.parse(req.params)
    const transaction = await transactionService.getById(userId, id)

    sendData(res, transaction)
  },

  async update(req: Request, res: Response) {
    const userId = getAuthPayload(req).sub
    const { id } = transactionParamsSchema.parse(req.params)
    const payload = updateTransactionSchema.parse(req.body)
    const transaction = await transactionService.update(userId, id, payload)

    sendData(res, transaction)
  },

  async delete(req: Request, res: Response) {
    const userId = getAuthPayload(req).sub
    const { id } = transactionParamsSchema.parse(req.params)
    await transactionService.delete(userId, id)

    res.status(204).send()
  },

  async summarize(req: Request, res: Response) {
    const userId = getAuthPayload(req).sub
    const query = transactionSummaryQuerySchema.parse(req.query)
    const summary = await transactionService.summarize(userId, query)

    sendData(res, summary)
  },
}
