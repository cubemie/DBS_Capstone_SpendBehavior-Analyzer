import e from 'express'
import { categoryController } from '../controllers/category-controller.ts'
import { requireAuth } from '../middlewares/auth-middleware.ts'

export const categoryRouter = e.Router()

categoryRouter.use(requireAuth)
categoryRouter.get('/', categoryController.list)
categoryRouter.post('/', categoryController.create)
categoryRouter.patch('/:id', categoryController.update)
categoryRouter.delete('/:id', categoryController.delete)
