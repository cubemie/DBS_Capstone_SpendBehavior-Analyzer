import { JwtPayload } from '../../modules/auth/auth-schema.ts'

declare global {
  namespace Express {
    export interface Request {
      payload?: JwtPayload
    }
  }
}
