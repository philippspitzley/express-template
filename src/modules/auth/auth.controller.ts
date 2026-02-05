import type { Request, Response } from 'express'
import z from 'zod'

import { asyncHandler } from '../../middleware/asyncHandler.ts'
import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from '../../middleware/errorHandler.ts'

import { userPublicSchema } from '../users/users.schema.ts'
import * as userService from '../users/users.service.ts'
import type { UserCreateRequest } from '../users/users.types.ts'

import appEnv, { isProd } from '../../../env.ts'
import type { AuthenticationRequest } from '../../middleware/auth.middleware.ts'
import * as authService from './auth.service.ts'
import type { EmailLoginParameters } from './auth.types.ts'
import { hashPassword, verifyPassword } from './auth.utils.ts'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd(),
  sameSite: 'lax' as const,
  maxAge: appEnv.RT_EXPIRES_IN,
  path: '/',
}

export const registerHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const payload: UserCreateRequest = req.body

    const existingEmail = await userService.getByEmail(payload.email)
    if (existingEmail) {
      // TODO: Logic to inform existing user that someone tries to register with same email.
      throw new ConflictError('Email already exists')
    }

    const existingUsername = await userService.getByUsername(payload.username)
    if (existingUsername) {
      throw new ConflictError('Username already exists')
    }

    const hashedPassword = await hashPassword(payload.password)
    const newUser = await userService.create({
      ...payload,
      password: hashedPassword,
    })

    const accessToken = await authService.generateToken({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    })

    const refreshToken = authService.createRefreshToken()
    const refreshTokenHash = authService.hashRefreshToken(refreshToken)
    await authService.saveRefreshToken(refreshTokenHash, newUser.id)

    res.cookie('session', refreshToken, COOKIE_OPTIONS)

    const publicUser = z.parse(userPublicSchema, newUser)

    res.status(201).json({ data: publicUser, accessToken })
  },
)

export const loginHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password }: EmailLoginParameters = req.body

    const user = await userService.getByEmail(email)

    if (!user) {
      throw new UnauthorizedError('Incorrect email or password')
    }

    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      throw new UnauthorizedError('Incorrect email or password')
    }

    const activeRefreshTokens =
      await authService.getActiveRefreshTokensByUserId(user.id)

    if (activeRefreshTokens.length > 0) {
      await Promise.all(
        activeRefreshTokens.map((refreshToken) =>
          authService.revokeRefreshTokenByHash(refreshToken.token),
        ),
      )
    }

    const accessToken = await authService.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    })

    const refreshToken = authService.createRefreshToken()
    const refreshTokenHash = authService.hashRefreshToken(refreshToken)
    await authService.saveRefreshToken(refreshTokenHash, user.id)

    res.cookie('session', refreshToken, COOKIE_OPTIONS)

    const publicUser = z.parse(userPublicSchema, user)

    res.status(200).json({ data: publicUser, accessToken })
  },
)

export const refreshTokenHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.session

    if (!refreshToken) throw new UnauthorizedError('No refresh token found')

    const refreshTokenHash = authService.hashRefreshToken(refreshToken)

    const refreshTokenInDb =
      await authService.getRefreshTokensByHash(refreshTokenHash)

    if (!refreshTokenInDb) {
      throw new UnauthorizedError('Invalid session')
    }

    if (refreshTokenInDb.revokedAt) {
      const activeTokens = await authService.getActiveRefreshTokensByUserId(
        refreshTokenInDb.userId,
      )
      await Promise.all(
        activeTokens.map((t) => authService.revokeRefreshTokenByHash(t.token)),
      )
      res.clearCookie('session', COOKIE_OPTIONS)
      throw new ForbiddenError('Session compromised. Please login again.')
    }

    if (new Date(refreshTokenInDb.expiresAt) < new Date()) {
      throw new UnauthorizedError('Session expired')
    }

    const user = await userService.getById(refreshTokenInDb.userId)

    const newRefreshToken = authService.createRefreshToken()
    const newRefreshTokenHash = authService.hashRefreshToken(newRefreshToken)
    await authService.saveRefreshToken(newRefreshTokenHash, user.id)

    await authService.revokeRefreshTokenByHash(refreshTokenInDb.token)
    res.cookie('session', newRefreshToken, COOKIE_OPTIONS)

    const accessToken = await authService.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    })

    const publicUser = userPublicSchema.parse(user)

    res.status(200).json({ data: publicUser, accessToken })
  },
)

export const logoutHandler = asyncHandler(
  async (req: AuthenticationRequest, res: Response) => {
    const currentRefreshToken = req.cookies?.session

    if (currentRefreshToken) {
      const refreshTokenHash = authService.hashRefreshToken(currentRefreshToken)
      await authService.revokeRefreshTokenByHash(refreshTokenHash)
    }

    res.clearCookie('session', COOKIE_OPTIONS)

    res.sendStatus(204)
  },
)
