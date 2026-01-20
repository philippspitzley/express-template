import crypto, { createSecretKey } from 'crypto'
import { SignJWT, jwtVerify } from 'jose'
import appEnv from '../../../env.ts'
import db from '../../db/connection.ts'
import { UnauthorizedError } from '../../middleware/errors.ts'
import * as userService from '../users/users.service.ts'
import { refreshTokens } from './auth.model.ts'
import type { CustomJwtPayload } from './auth.types.ts'
import { hashPassword, verifyPassword } from './auth.utils.ts'

export const login = async (email: string, password: string) => {
  // check if user is already logged in

  const user = await userService.getByEmail(email)

  if (!user) {
    throw new UnauthorizedError('Incorrect email or password')
  }

  const isValidPassword = await verifyPassword(password, user.password)

  if (!isValidPassword) {
    throw new UnauthorizedError('Incorrect email or password')
  }

  const token = await generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
  })
  // const refreshToken = makeRefreshToken()

  // const expiration = new Date(
  //   Math.floor(Date.now() / 1000) + config.api.refreshTokenExpiresIn,
  // )

  // const refreshTokenObj = await createRefreshToken({
  //   token: refreshToken,
  //   userId: user.id,
  //   expiresAt: new Date(
  //     Math.floor(Date.now() / 1000) + config.api.refreshTokenExpiresIn,
  //   ),
  //   revokedAt: null,
  // })

  return { user, token }
}

export const generateToken = async (
  payload: CustomJwtPayload,
): Promise<string> => {
  const secretKey = createSecretKey(appEnv.JWT_SECRET, 'utf-8')

  const token = await new SignJWT({
    id: payload.id,
    email: payload.email,
    username: payload.username,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(appEnv.JWT_EXPIRES_IN || '7d')
    .sign(secretKey)

  return token
}

export const verifyToken = async (token: string) => {
  const secretKey = createSecretKey(appEnv.JWT_SECRET, 'utf-8')
  const { payload } = await jwtVerify(token, secretKey)

  return {
    id: payload.id as string,
    email: payload.email as string,
    username: payload.username as string,
  } satisfies CustomJwtPayload
}

export const createRefreshToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

export const saveRefreshToken = async (token: string, userId: string) => {
  const expiresAt = new Date(Date.now() + appEnv.JWT_EXPIRES_IN)

  const hashedRefreshToken = await hashPassword(token)

  const [refreshToken] = await db
    .insert(refreshTokens)
    .values({ token: hashedRefreshToken, userId, expiresAt, revokedAt: null })
    .returning()

  return refreshToken
}
