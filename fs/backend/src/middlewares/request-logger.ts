import type { Request, Response, NextFunction } from 'express'
import { logRequest } from '../utils/logger.ts'

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const startAt = process.hrtime.bigint() // nanosecond precision

  res.on('finish', () => {
    const endAt = process.hrtime.bigint()
    const durationMs = Number((endAt - startAt) / BigInt(1_000_000))

    logRequest(req.method, req.originalUrl, res.statusCode, durationMs)
  })

  next()
}
