import e from 'express'
import { requireAuth } from '../middlewares/auth-middleware.ts'
import { transactionController } from '../controllers/transaction-controller.ts'

export const transactionRouter = e.Router()

transactionRouter.use(requireAuth)
transactionRouter.get('/', transactionController.list)
transactionRouter.post('/', transactionController.create)
transactionRouter.get('/summary', transactionController.summarize)
transactionRouter.get('/:id', transactionController.getById)
transactionRouter.patch('/:id', transactionController.update)
transactionRouter.delete('/:id', transactionController.delete)
