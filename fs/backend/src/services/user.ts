import type { UserResponseDto } from '../schemas/user.ts'
import * as userQuery from '../queries/user.ts'
import { AppException } from '../exception.ts'
import type { CreateUserDto } from '../schemas/user.ts'
import { hashPassword } from '../utils/password.ts'

export async function newUser(dto: CreateUserDto): Promise<string> {
  const existing = await userQuery.getByEmail(dto.email)
  if (existing) {
    throw new AppException('Email sudah terdaftar', 409)
  }

  const hashedPassword = await hashPassword(dto.password)

  const id = await userQuery.create({
    fullName: dto.fullName,
    email: dto.email,
    passwordHash: hashedPassword,
  })

  return id
}

export async function getUserDetails(id: string): Promise<UserResponseDto> {
  const user = await userQuery.getById(id)
  if (!user) {
    throw new AppException('User tidak ditemukan', 404)
  }

  return user
}
