import { eq } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { users } from '../../db/schemas/users.ts'

export type UserRecord = typeof users.$inferSelect

export type CreateUserRecord = {
  fullName: string
  email: string
  passwordHash: string
  avatarUrl?: string | null
  phone?: string | null
}

export const userRepository = {
  async findByEmail(email: string): Promise<UserRecord | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email))

    return user
  },

  async findById(id: string): Promise<UserRecord | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id))

    return user
  },

  async create(record: CreateUserRecord): Promise<UserRecord> {
    const [user] = await db.insert(users).values(record).returning()

    return user
  },

  async update(
    id: string,
    record: Partial<CreateUserRecord>,
  ): Promise<UserRecord | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...record, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()

    return user
  },
}
