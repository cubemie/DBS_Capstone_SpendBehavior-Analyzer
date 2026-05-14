import { loadEnvFile } from 'node:process'
import * as z from 'zod'

loadEnvFile()

export const env = z
  .object({
    PORT: z.coerce.number().default(3000),
    APP_URL: z.url().default('http://localhost:3000'),
    DATABASE_URL: z.url().startsWith('postgres://'),
    JWT_SECRET: z.string(),
  })
  .parse(process.env)
