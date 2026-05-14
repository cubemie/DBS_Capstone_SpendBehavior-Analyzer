import type { Request, Response, NextFunction } from 'express'
import { AppException } from '../exception.ts'
import { ZodError } from 'zod'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppException) {
    return res.status(err.statusCode).json({
      message: err.message,
    })
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))

    return res.status(400).json({
      message: 'Validasi gagal',
      details: formattedErrors,
    })
  }

  console.error('[Unhandled Error]:', err)
  return res.status(500).json({
    message: 'Terjadi kesalahan pada server',
  })
}
