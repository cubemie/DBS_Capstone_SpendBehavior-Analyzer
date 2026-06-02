import { AppException } from '../exception.ts'
import type {
  AuthSessionContext,
  LoginDto,
  RegisterDto,
} from '../schemas/auth-schema.ts'
import { createAccessToken } from '../utils/jwt.ts'
import { verifyPassword } from '../utils/password.ts'
import { userRepository } from '../repositories/user-repository.ts'
import { createOpaqueToken, hashToken } from '../utils/token.ts'
import { refreshTokenRepository } from '../repositories/refresh-token-repository.ts'
import { env } from '../config.ts'
import { userService } from './user-service.ts'
import type { UserResponseDto } from '../schemas/user-schema.ts'

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type RegisterResponse = AuthTokens & {
  user: UserResponseDto
}

function createRefreshTokenExpiresAt(): Date {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_IN_DAYS)

  return expiresAt
}

async function createSession(
  userId: string,
  context: AuthSessionContext,
): Promise<AuthTokens> {
  const refreshToken = createOpaqueToken()
  const refreshTokenRecord = await refreshTokenRepository.create({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: createRefreshTokenExpiresAt(),
    userAgent: context.userAgent,
    ipAddress: context.ipAddress,
  })

  const accessToken = createAccessToken({
    sub: userId,
    sessionId: refreshTokenRecord.id,
  })

  return { accessToken, refreshToken }
}

export const authService = {
  async register(
    dto: RegisterDto,
    context: AuthSessionContext,
  ): Promise<RegisterResponse> {
    const user = await userService.create(dto)
    const tokens = await createSession(user.id, context)

    return {
      ...tokens,
      user,
    }
  },

  async login(
    dto: LoginDto,
    context: AuthSessionContext,
  ): Promise<AuthTokens> {
    const user = await userRepository.findByEmail(dto.email)
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

    return await createSession(user.id, context)
  },

  async refresh(
    refreshToken: string | undefined,
    context: AuthSessionContext,
  ): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new AppException('Refresh token tidak ditemukan', 401)
    }

    const now = new Date()
    const currentRefreshToken = await refreshTokenRepository.findActiveByHash(
      hashToken(refreshToken),
      now,
    )

    if (!currentRefreshToken) {
      throw new AppException('Refresh token tidak valid', 401)
    }

    const nextRefreshToken = createOpaqueToken()
    const nextRefreshTokenRecord = await refreshTokenRepository.create({
      userId: currentRefreshToken.userId,
      tokenHash: hashToken(nextRefreshToken),
      expiresAt: createRefreshTokenExpiresAt(),
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
    })

    await refreshTokenRepository.revokeAndReplace(
      currentRefreshToken.id,
      nextRefreshTokenRecord.id,
      now,
    )

    const accessToken = createAccessToken({
      sub: currentRefreshToken.userId,
      sessionId: nextRefreshTokenRecord.id,
    })

    return {
      accessToken,
      refreshToken: nextRefreshToken,
    }
  },

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return
    }

    const now = new Date()
    const currentRefreshToken = await refreshTokenRepository.findActiveByHash(
      hashToken(refreshToken),
      now,
    )

    if (!currentRefreshToken) {
      return
    }

    await refreshTokenRepository.revoke(currentRefreshToken.id, now)
  },

  async me(userId: string): Promise<UserResponseDto> {
    return await userService.getDetails(userId)
  },
}
