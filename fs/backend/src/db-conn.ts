import { Pool } from 'pg'
import { env } from './config.ts'

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
})
