import e from 'express'
import { requireAuth } from '../middlewares/auth-middleware.ts'
import { userController } from '../controllers/user-controlller.ts'

export const userRouter = e.Router()

userRouter.post('/', userController.register)
userRouter.get('/:id', requireAuth, userController.getDetails)
