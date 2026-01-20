import type { NextFunction, Request, Response } from 'express'

import * as authService from '../modules/auth/auth.service.ts'
import type { CustomJwtPayload } from '../modules/auth/auth.types.ts'
import { getBearerToken } from '../modules/auth/auth.utils.ts'

export interface AuthenticationRequest extends Request {
  user?: CustomJwtPayload
}
export const authenticate = async (
  req: AuthenticationRequest,
  _res: Response,
  next: NextFunction,
) => {
  const bearerToken = getBearerToken(req)

  const decoded = await authService.verifyToken(bearerToken)

  req.user = decoded

  next()
}
