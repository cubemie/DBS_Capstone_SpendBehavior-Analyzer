import { JwtPayload } from '../../schemas/auth.ts'

declare global {
  namespace Express {
    export interface Request {
      payload?: JwtPayload
    }
  }
}
