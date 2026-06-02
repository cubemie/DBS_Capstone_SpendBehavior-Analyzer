import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  fullName: text().notNull(),
  email: text().unique().notNull(),
  passwordHash: text().notNull(),
  avatarUrl: text(),
  phone: text(),
  locale: text().notNull().default('id-ID'),
  timezone: text().notNull().default('Asia/Jakarta'),
  persona: text(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})
