import { AppException } from '../../exception.ts'
import { hashPassword, verifyPassword } from '../../utils/password.ts'
import type {
  ChangePasswordDto,
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from './user-schema.ts'
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

  async updateMe(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const updated = await userRepository.update(id, {
      fullName: dto.fullName,
      phone: dto.phone,
      locale: dto.locale,
      timezone: dto.timezone,
      avatarUrl: dto.avatarUrl,
    })

    if (!updated) {
      throw new AppException('User tidak ditemukan', 404)
    }

    return toUserResponse(updated)
  },

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await userRepository.findById(id)
    if (!user) {
      throw new AppException('User tidak ditemukan', 404)
    }

    const isValid = await verifyPassword(dto.currentPassword, user.passwordHash)
    if (!isValid) {
      throw new AppException('Password lama tidak sesuai', 400)
    }

    const newHash = await hashPassword(dto.newPassword)
    await userRepository.update(id, { passwordHash: newHash })
  },

  async deleteMe(id: string): Promise<void> {
    await userRepository.delete(id)
  },
}
