import {
  type AnyPgColumn,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './users.ts'

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text().unique().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  revokedAt: timestamp({ withTimezone: true }),
  replacedByTokenId: uuid().references(
    (): AnyPgColumn => refreshTokens.id,
  ),
  userAgent: text(),
  ipAddress: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})
