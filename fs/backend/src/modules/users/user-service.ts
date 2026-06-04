import { AppException } from '../../exception.ts'
import fs from 'node:fs/promises'
import path from 'node:path'
import { hashPassword, verifyPassword } from '../../utils/password.ts'
import type {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  ChangePasswordDto,
} from './user-schema.ts'
import { type UserRecord, userRepository } from './user-repository.ts'
import { avatarUpload } from './avatar-upload-middleware.ts'

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

function getLocalAvatarPath(avatarUrl: string | null): string | null {
  if (!avatarUrl) {
    return null
  }

  let url: URL
  try {
    url = new URL(avatarUrl)
  } catch {
    return null
  }

  if (!url.pathname.startsWith('/uploads/avatars/')) {
    return null
  }

  const filename = path.basename(url.pathname)
  const filePath = path.resolve(avatarUpload.uploadDir, filename)
  const relativePath = path.relative(avatarUpload.uploadDir, filePath)

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return null
  }

  return filePath
}

async function deleteFileIfExists(filePath: string): Promise<void> {
  await fs.unlink(filePath).catch((error: unknown) => {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return
    }

    throw error
  })
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

  async updateAvatar(
    id: string,
    dto: { avatarUrl: string; uploadedFilePath: string },
  ): Promise<UserResponseDto> {
    const existingUser = await userRepository.findById(id)
    if (!existingUser) {
      await deleteFileIfExists(dto.uploadedFilePath)
      throw new AppException('User tidak ditemukan', 404)
    }

    const user = await userRepository.update(id, {
      avatarUrl: dto.avatarUrl,
    })

    if (!user) {
      await deleteFileIfExists(dto.uploadedFilePath)
      throw new AppException('User tidak ditemukan', 404)
    }

    const previousAvatarPath = getLocalAvatarPath(existingUser.avatarUrl)
    if (previousAvatarPath && previousAvatarPath !== dto.uploadedFilePath) {
      await deleteFileIfExists(previousAvatarPath)
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
