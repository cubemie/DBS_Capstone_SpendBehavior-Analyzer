import { AppException } from '../exception.ts'
import * as userQuery from '../queries/user.ts'
import type { AuthResponseDto, LoginDto } from '../schemas/auth.ts'
import { createAccessToken } from '../utils/jwt.ts'
import * as password from '../utils/password.ts'

export async function authenticate(dto: LoginDto): Promise<AuthResponseDto> {
  const user = await userQuery.getByEmail(dto.email)
  if (!user) {
    throw new AppException('Email atau password salah', 401)
  }

  const isPasswordCorrect = await password.verifyPassword(
    dto.password,
    user.passwordHash,
  )

  if (!isPasswordCorrect) {
    throw new AppException('Email atau password salah', 401)
  }

  const accessToken = createAccessToken({ sub: user.id })

  return { accessToken }
}
