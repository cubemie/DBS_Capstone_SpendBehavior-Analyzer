import { pool } from '../db-conn.ts'
import type { User } from '../schemas/user.ts'

interface UserFromDatabase {
  id: string
  full_name: string
  email: string
  password_hash: string
  created_at: Date
}

export async function getByEmail(email: string): Promise<User | null> {
  const result = await pool.query<UserFromDatabase>(
    'SELECT id, full_name, email, password_hash, created_at FROM users WHERE email = $1',
    [email],
  )
  const row = result.rows[0]

  if (!row) return null
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  }
}

export async function getById(id: string): Promise<User | null> {
  const result = await pool.query<UserFromDatabase>(
    'SELECT id, full_name, email, password_hash, created_at FROM users WHERE id = $1',
    [id],
  )
  const row = result.rows[0]

  if (!row) return null
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  }
}

export async function create(
  data: Omit<User, 'id' | 'createdAt'>,
): Promise<string> {
  const result = await pool.query<Pick<UserFromDatabase, 'id'>>(
    'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
    [data.fullName, data.email, data.passwordHash],
  )

  return result.rows[0].id
}
