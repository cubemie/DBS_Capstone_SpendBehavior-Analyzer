import type { CookieOptions, Request, Response } from 'express'
import { loginSchema, registerSchema } from './auth-schema.ts'
import { env } from '../../config.ts'
import { sendData } from '../../utils/response.ts'
import { authService } from './auth-service.ts'

const refreshTokenCookieName = 'refresh_token'

function getRefreshTokenCookie(req: Request): string | undefined {
  const refreshToken: unknown = req.cookies[refreshTokenCookieName]

  if (typeof refreshToken !== 'string') {
    return undefined
  }

  return refreshToken
}

function getBaseRefreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.REFRESH_COOKIE_SECURE,
    path: '/api/v1/auth',
  }
}

function getRefreshCookieOptions(): CookieOptions {
  return {
    ...getBaseRefreshCookieOptions(),
    maxAge: env.REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
  }
}

function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie(refreshTokenCookieName, refreshToken, getRefreshCookieOptions())
}

function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(refreshTokenCookieName, getBaseRefreshCookieOptions())
}

function getSessionContext(req: Request) {
  return {
    userAgent: req.get('user-agent'),
    ipAddress: req.ip,
  }
}

export const authController = {
  async register(req: Request, res: Response) {
    const payload = registerSchema.parse(req.body)
    const authResponse = await authService.register(
      payload,
      getSessionContext(req),
    )

    setRefreshTokenCookie(res, authResponse.refreshToken)

    sendData(
      res,
      {
        accessToken: authResponse.accessToken,
        user: authResponse.user,
      },
      201,
    )
  },

  async login(req: Request, res: Response) {
    const payload = loginSchema.parse(req.body)

    const tokens = await authService.login(payload, getSessionContext(req))

    setRefreshTokenCookie(res, tokens.refreshToken)

    sendData(res, { accessToken: tokens.accessToken })
  },

  async refresh(req: Request, res: Response) {
    const tokens = await authService.refresh(
      getRefreshTokenCookie(req),
      getSessionContext(req),
    )

    setRefreshTokenCookie(res, tokens.refreshToken)

    sendData(res, { accessToken: tokens.accessToken })
  },

  async logout(req: Request, res: Response) {
    await authService.logout(getRefreshTokenCookie(req))

    clearRefreshTokenCookie(res)

    res.status(204).send()
  },

  async me(req: Request, res: Response) {
    const payload = req.payload!
    const user = await authService.me(payload.sub)

    sendData(res, user)
  },
}
