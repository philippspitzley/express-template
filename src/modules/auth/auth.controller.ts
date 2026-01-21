import type { Request, Response } from 'express'
import z from 'zod'

import { asyncHandler } from '../../middleware/asyncHandler.ts'
import {
  AppError,
  ConflictError,
  UnauthorizedError,
} from '../../middleware/errorHandler.ts'

import { userPublicSchema } from '../users/users.schema.ts'
import * as userService from '../users/users.service.ts'
import type { UserCreateRequest } from '../users/users.types.ts'

import appEnv from '../../../env.ts'
import * as authService from './auth.service.ts'
import type { EmailLoginParameters } from './auth.types.ts'
import { hashPassword, verifyPassword } from './auth.utils.ts'

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

    await authService.saveRefreshToken(refreshToken, newUser.id)

    res.cookie('session', refreshToken, {
      httpOnly: true,
      secure: appEnv.APP_STAGE === 'production',
      sameSite: 'lax',
      maxAge: appEnv.JWT_EXPIRES_IN,
    })

    const publicUser = z.parse(userPublicSchema, newUser)

    res.status(201).json({ data: publicUser, accessToken, refreshToken })
  },
)

export const loginHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password }: EmailLoginParameters = req.body

    // check if user is already logged in

    const user = await userService.getByEmail(email)

    if (!user) {
      throw new UnauthorizedError('Incorrect email or password')
    }

    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      throw new UnauthorizedError('Incorrect email or password')
    }

    const accessToken = await authService.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    })

    const refreshToken = authService.createRefreshToken()

    const safedRefreshToken = await authService.saveRefreshToken(
      refreshToken,
      user.id,
    )

    if (!safedRefreshToken) {
      throw new AppError('Refresh token could not be saved in the db')
    }
    const publicUser = z.parse(userPublicSchema, user)

    res.status(200).json({ data: publicUser, accessToken, refreshToken })
  },
)
