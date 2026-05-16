import type { UserResponseDto } from '../schemas/user-schema.ts'
import { AppException } from '../exception.ts'
import type { CreateUserDto } from '../schemas/user-schema.ts'
import { hashPassword } from '../utils/password.ts'
import { db } from '../db/index.ts'
import { users } from '../db/schemas/users.ts'
import { eq } from 'drizzle-orm'

export const userService = {
  async create(dto: CreateUserDto): Promise<string> {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))

    if (existing) {
      throw new AppException('Email sudah terdaftar', 409)
    }

    const passwordHash = await hashPassword(dto.password)

    const [result] = await db
      .insert(users)
      .values({
        fullName: dto.fullName,
        email: dto.email,
        passwordHash: passwordHash,
        avatarUrl: dto.avatarUrl,
      })
      .returning({ insertedId: users.id })

    return result.insertedId
  },

  async getDetails(id: string): Promise<UserResponseDto> {
    const [user] = await db.select().from(users).where(eq(users.id, id))
    if (!user) {
      throw new AppException('User tidak ditemukan', 404)
    }

    return user
  },
}
