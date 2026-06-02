import { and, eq, gt, isNull } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { refreshTokens } from '../db/schemas/refresh-tokens.ts'

export type RefreshTokenRecord = typeof refreshTokens.$inferSelect

export type CreateRefreshTokenRecord = {
  userId: string
  tokenHash: string
  expiresAt: Date
  userAgent?: string | null
  ipAddress?: string | null
}

export const refreshTokenRepository = {
  async create(record: CreateRefreshTokenRecord): Promise<RefreshTokenRecord> {
    const [refreshToken] = await db
      .insert(refreshTokens)
      .values(record)
      .returning()

    return refreshToken
  },

  async findActiveByHash(
    tokenHash: string,
    now: Date,
  ): Promise<RefreshTokenRecord | undefined> {
    const [refreshToken] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, now),
        ),
      )

    return refreshToken
  },

  async revoke(id: string, revokedAt: Date): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt })
      .where(eq(refreshTokens.id, id))
  },

  async revokeAndReplace(
    id: string,
    replacedByTokenId: string,
    revokedAt: Date,
  ): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt, replacedByTokenId })
      .where(eq(refreshTokens.id, id))
  },
}
