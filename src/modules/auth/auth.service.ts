import crypto, { createSecretKey } from 'crypto'
import { and, eq, isNull } from 'drizzle-orm'
import { SignJWT, jwtVerify } from 'jose'
import appEnv from '../../../env.ts'
import db from '../../db/connection.ts'
import { refreshTokens } from './auth.model.ts'
import type { CustomJwtPayload } from './auth.types.ts'

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
    .setExpirationTime(appEnv.JWT_EXPIRES_IN || '1h')
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

export const hashRefreshToken = (token: string) => {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex')
}

export const saveRefreshToken = async (tokenHash: string, userId: string) => {
  const expiresAt = new Date(Date.now() + appEnv.RT_EXPIRES_IN)

  const [savedRefreshToken] = await db
    .insert(refreshTokens)
    .values({ token: tokenHash, userId, expiresAt, revokedAt: null })
    .returning()

  return savedRefreshToken
}

export const revokeRefreshTokenByHash = async (tokenHash: string) => {
  const [revokedToken] = await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.token, tokenHash))
    .returning()

  return revokedToken
}

export const getRefreshTokensByHash = async (tokenHash: string) => {
  const [refreshTokenInDB] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, tokenHash))

  return refreshTokenInDB
}

export const getActiveRefreshTokensByUserId = async (userId: string) => {
  const refreshTokenInDB = await db
    .select()
    .from(refreshTokens)
    .where(
      and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
    )

  return refreshTokenInDB
}

export const getActiveRefreshTokenByHash = async (tokenHash: string) => {
  const [refreshToken] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(eq(refreshTokens.token, tokenHash), isNull(refreshTokens.revokedAt)),
    )

  return refreshToken
}
