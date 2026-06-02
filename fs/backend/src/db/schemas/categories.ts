import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './users.ts'

export const categories = pgTable(
  'categories',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid().references(() => users.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    slug: text().notNull(),
    kind: text().notNull(),
    mlKey: text(),
    color: text(),
    icon: text(),
    isSystem: boolean().notNull().default(false),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('categories_system_kind_slug_unique')
      .on(table.kind, table.slug)
      .where(sql`${table.userId} is null`),
    uniqueIndex('categories_user_kind_slug_unique')
      .on(table.userId, table.kind, table.slug)
      .where(sql`${table.userId} is not null`),
    index('categories_user_kind_idx').on(table.userId, table.kind),
  ],
)
