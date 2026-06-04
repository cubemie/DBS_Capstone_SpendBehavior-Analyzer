import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { afterEach, test } from 'node:test'
import { avatarUpload } from './avatar-upload-middleware.ts'
import type { UserRecord } from './user-repository.ts'
import { userRepository } from './user-repository.ts'
import { userService } from './user-service.ts'

type FindById = typeof userRepository.findById
type Update = typeof userRepository.update

const originalFindById = userRepository.findById
const originalUpdate = userRepository.update
const filesToCleanUp = new Set<string>()

function createUserRecord(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    fullName: 'Budi Santoso',
    email: 'budi@example.com',
    passwordHash: 'hashed-password',
    avatarUrl: null,
    phone: null,
    locale: 'id-ID',
    timezone: 'Asia/Jakarta',
    persona: null,
    updatedAt: new Date('2026-06-04T00:00:00.000Z'),
    createdAt: new Date('2026-06-04T00:00:00.000Z'),
    ...overrides,
  }
}

async function createAvatarFile(filename: string): Promise<string> {
  await fs.mkdir(avatarUpload.uploadDir, { recursive: true })
  const filePath = path.join(avatarUpload.uploadDir, filename)
  await fs.writeFile(filePath, 'avatar')
  filesToCleanUp.add(filePath)

  return filePath
}

async function fileExists(filePath: string): Promise<boolean> {
  return await fs
    .access(filePath)
    .then(() => true)
    .catch(() => false)
}

afterEach(async () => {
  userRepository.findById = originalFindById
  userRepository.update = originalUpdate

  await Promise.all(
    [...filesToCleanUp].map(async (filePath) => {
      await fs.unlink(filePath).catch(() => undefined)
    }),
  )
  filesToCleanUp.clear()
})

test('avatar update stores the new URL and removes the previous local avatar', async () => {
  const oldFilename = `${crypto.randomUUID()}.jpg`
  const newFilename = `${crypto.randomUUID()}.webp`
  const oldAvatarPath = await createAvatarFile(oldFilename)
  const newAvatarPath = await createAvatarFile(newFilename)
  const oldAvatarUrl = `http://localhost:3000/uploads/avatars/${oldFilename}`
  const newAvatarUrl = `http://localhost:3000/uploads/avatars/${newFilename}`
  const existingUser = createUserRecord({ avatarUrl: oldAvatarUrl })

  userRepository.findById = (async () => existingUser) satisfies FindById
  userRepository.update = (async (_id, record) =>
    createUserRecord({
      ...existingUser,
      ...record,
      updatedAt: new Date('2026-06-04T01:00:00.000Z'),
    })) satisfies Update

  const user = await userService.updateAvatar(existingUser.id, {
    avatarUrl: newAvatarUrl,
    uploadedFilePath: newAvatarPath,
  })

  assert.equal(user.avatarUrl, newAvatarUrl)
  assert.equal(await fileExists(oldAvatarPath), false)
  assert.equal(await fileExists(newAvatarPath), true)
})

test('avatar update does not remove previous external avatar URLs', async () => {
  const newFilename = `${crypto.randomUUID()}.png`
  const newAvatarPath = await createAvatarFile(newFilename)
  const newAvatarUrl = `http://localhost:3000/uploads/avatars/${newFilename}`
  const existingUser = createUserRecord({
    avatarUrl: 'https://cdn.example.com/avatar.jpg',
  })

  userRepository.findById = (async () => existingUser) satisfies FindById
  userRepository.update = (async (_id, record) =>
    createUserRecord({
      ...existingUser,
      ...record,
      updatedAt: new Date('2026-06-04T01:00:00.000Z'),
    })) satisfies Update

  const user = await userService.updateAvatar(existingUser.id, {
    avatarUrl: newAvatarUrl,
    uploadedFilePath: newAvatarPath,
  })

  assert.equal(user.avatarUrl, newAvatarUrl)
  assert.equal(await fileExists(newAvatarPath), true)
})
