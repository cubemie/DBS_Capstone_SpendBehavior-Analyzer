import {
  bigint,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { categories } from './categories.ts'
import { users } from './users.ts'

export const transactions = pgTable(
  'transactions',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    categoryId: uuid()
      .notNull()
      .references(() => categories.id),
    title: text().notNull(),
    merchantName: text(),
    paymentMethod: text(),
    type: text().notNull(),
    amountIdr: bigint({ mode: 'number' }).notNull(),
    transactionDate: timestamp({ withTimezone: true }).notNull().defaultNow(),
    notes: text(),
    source: text().notNull().default('manual'),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('transactions_user_date_idx').on(table.userId, table.transactionDate),
    index('transactions_user_category_idx').on(table.userId, table.categoryId),
    index('transactions_user_type_date_idx').on(
      table.userId,
      table.type,
      table.transactionDate,
    ),
  ],
)
