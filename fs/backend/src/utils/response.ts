import type { Response } from 'express'

export function sendData<T>(res: Response, data: T, statusCode: number = 200) {
  return res.status(statusCode).json(data)
}
