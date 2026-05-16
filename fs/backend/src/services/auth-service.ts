import { eq } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { users } from '../db/schemas/users.ts'
import { AppException } from '../exception.ts'
import type { AuthResponseDto, LoginDto } from '../schemas/auth-schema.ts'
import { createAccessToken } from '../utils/jwt.ts'
import { verifyPassword } from '../utils/password.ts'

export const authService = {
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
    if (!user) {
      throw new AppException('Email atau password salah', 401)
    }

    const isPasswordCorrect = await verifyPassword(
      dto.password,
      user.passwordHash,
    )

    if (!isPasswordCorrect) {
      throw new AppException('Email atau password salah', 401)
    }

    const accessToken = createAccessToken({ sub: user.id })

    return { accessToken }
  },
}
