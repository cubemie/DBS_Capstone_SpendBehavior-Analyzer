import e from 'express'
import { requireAuth } from '../../middlewares/auth-middleware.ts'
import { userController } from './user-controller.ts'

export const userRouter = e.Router()

// Semua route users butuh auth
userRouter.use(requireAuth)

// GET /users/me — profil user yang sedang login
userRouter.get('/me', userController.getMe)

// PUT /users/me — update profil
userRouter.put('/me', userController.updateMe)

// PUT /users/me/password — ganti password
userRouter.put('/me/password', userController.changePassword)

// DELETE /users/me — hapus akun
userRouter.delete('/me', userController.deleteMe)

// GET /users/:id — get detail by ID (legacy)
userRouter.get('/:id', userController.getDetails)
