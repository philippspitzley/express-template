import type { NextFunction, Request, Response } from 'express'

import { JWTExpired } from 'jose/errors'
import * as authService from '../modules/auth/auth.service.ts'
import type { CustomJwtPayload } from '../modules/auth/auth.types.ts'
import { getBearerToken } from '../modules/auth/auth.utils.ts'
import { JWTExpiredError, UnauthorizedError } from './errorHandler.ts'

export interface AuthenticationRequest extends Request {
  user?: CustomJwtPayload & { authenticated: boolean }
}
export const authenticate = async (
  req: AuthenticationRequest,
  res: Response,
  next: NextFunction,
) => {
  const bearerToken = getBearerToken(req)
  try {
    const decoded = await authService.verifyToken(bearerToken)
    req.user = { ...decoded, authenticated: true }
    next()
  } catch (error) {
    if (error instanceof JWTExpired) {
      res.set(
        'WWW-Authenticate',
        'Bearer error="invalid_token", error_description="The access token expired"',
      )
      throw new JWTExpiredError('Token expired.')
    }
    throw new UnauthorizedError('Not authorized')
  }
}
