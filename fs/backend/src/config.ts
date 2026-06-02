import { loadEnvFile } from 'node:process'
import * as z from 'zod'

loadEnvFile()

export const env = z
  .object({
    PORT: z.coerce.number().default(3000),
    APP_URL: z.url().default('http://localhost:3000'),
    DATABASE_URL: z.url().startsWith('postgres://'),
    JWT_SECRET: z.string(),
    ACCESS_TOKEN_EXPIRES_IN_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(900),
    REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce
      .number()
      .int()
      .positive()
      .default(7),
    REFRESH_COOKIE_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
  })
  .parse(process.env)
