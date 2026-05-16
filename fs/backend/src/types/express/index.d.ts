import { JwtPayload } from '../../schemas/auth-schema.ts'

declare global {
  namespace Express {
    export interface Request {
      payload?: JwtPayload
    }
  }
}
