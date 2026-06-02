import e from 'express'
import { requireAuth } from '../../middlewares/auth-middleware.ts'
import { categoryController } from './category-controller.ts'

export const categoryRouter = e.Router()

categoryRouter.use(requireAuth)
categoryRouter.get('/', categoryController.list)
categoryRouter.post('/', categoryController.create)
categoryRouter.patch('/:id', categoryController.update)
categoryRouter.delete('/:id', categoryController.delete)
