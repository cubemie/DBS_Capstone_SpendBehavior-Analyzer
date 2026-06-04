import e from 'express'
import { requireAuth } from '../../middlewares/auth-middleware.ts'
import { userController } from './user-controller.ts'

export const userRouter = e.Router()

userRouter.post('/', userController.register)
userRouter.get('/:id', requireAuth, userController.getDetails)
userRouter.patch('/:id', requireAuth, userController.update)
userRouter.patch('/:id/password', requireAuth, userController.changePassword)
