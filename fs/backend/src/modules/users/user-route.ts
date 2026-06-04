import e from 'express'
import { requireAuth } from '../../middlewares/auth-middleware.ts'
import { uploadAvatarFile } from './avatar-upload-middleware.ts'
import { userController } from './user-controller.ts'

export const userRouter = e.Router()

userRouter.use(requireAuth)
userRouter.patch('/me', userController.updateMe)
userRouter.patch('/me/avatar', uploadAvatarFile, userController.updateMyAvatar)
userRouter.patch('/me/password', userController.changeMyPassword)
