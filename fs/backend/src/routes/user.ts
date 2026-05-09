import e from 'express'
import * as userController from '../controllers/user.ts'
import { requireAuth } from '../middlewares/auth.ts'

export const userRouter = e.Router()

userRouter.post('/', userController.register)
userRouter.get('/:id', requireAuth, userController.getUserDetails)
