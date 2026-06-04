import { AppException } from '../../exception.ts'
import { hashPassword, verifyPassword } from '../../utils/password.ts'
import type { CreateUserDto, UpdateUserDto, UserResponseDto, ChangePasswordDto } from './user-schema.ts'
import { type UserRecord, userRepository } from './user-repository.ts'

function toUserResponse(user: UserRecord): UserResponseDto {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    locale: user.locale,
    timezone: user.timezone,
    persona: user.persona,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt,
  }
}

export const userService = {
  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await userRepository.findByEmail(dto.email)

    if (existing) {
      throw new AppException('Email sudah terdaftar', 409)
    }

    const passwordHash = await hashPassword(dto.password)

    const user = await userRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      avatarUrl: dto.avatarUrl,
      phone: dto.phone,
    })

    return toUserResponse(user)
  },

  async getDetails(id: string): Promise<UserResponseDto> {
    const user = await userRepository.findById(id)
    if (!user) {
      throw new AppException('User tidak ditemukan', 404)
    }

    return toUserResponse(user)
  },

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await userRepository.update(id, {
      fullName: dto.fullName,
      phone: dto.phone,
    })

    if (!user) {
      throw new AppException('User tidak ditemukan', 404)
    }

    return toUserResponse(user)
  },

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await userRepository.findById(id)
    if (!user) {
      throw new AppException('User tidak ditemukan', 404)
    }

    const isValid = await verifyPassword(dto.oldPassword, user.passwordHash)
    if (!isValid) {
      throw new AppException('Kata sandi lama salah', 400)
    }

    const newPasswordHash = await hashPassword(dto.newPassword)
    await userRepository.update(id, { passwordHash: newPasswordHash })
  },
}
