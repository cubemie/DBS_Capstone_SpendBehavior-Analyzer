import type { Request, Response, NextFunction } from 'express'
import { AppException } from '../exception.ts'
import multer from 'multer'
import { ZodError } from 'zod'
import { logError } from '../utils/logger.ts'

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

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Ukuran foto maksimal 2MB'
        : 'Upload foto tidak valid'

    return res.status(400).json({ message })
  }

  logError(err, `${_req.method} ${_req.originalUrl}`)
  return res.status(500).json({
    message: 'Terjadi kesalahan pada server',
  })
}
