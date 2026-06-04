import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import type { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import { AppException } from '../../exception.ts'

const avatarUploadDir = path.resolve('uploads', 'avatars')
const maxAvatarSizeBytes = 2 * 1024 * 1024

const imageExtensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
} as const

function getAvatarExtension(mimetype: string): string | undefined {
  if (mimetype in imageExtensions) {
    return imageExtensions[mimetype as keyof typeof imageExtensions]
  }

  return undefined
}

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    fs.mkdirSync(avatarUploadDir, { recursive: true })
    callback(null, avatarUploadDir)
  },
  filename(_req, file, callback) {
    const extension = getAvatarExtension(file.mimetype)
    callback(null, `${crypto.randomUUID()}${extension ?? '.bin'}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: maxAvatarSizeBytes,
    files: 1,
  },
  fileFilter(_req, file, callback) {
    if (!getAvatarExtension(file.mimetype)) {
      callback(new AppException('Format foto harus JPG, PNG, atau WebP', 400))
      return
    }

    callback(null, true)
  },
})

export function uploadAvatarFile(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  upload.single('avatar')(req, res, next)
}

export const avatarUpload = {
  uploadDir: avatarUploadDir,
  maxSizeBytes: maxAvatarSizeBytes,
}
