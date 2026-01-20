import type { Request, Response } from 'express'
import z from 'zod'
import { asyncHandler } from '../../middleware/asyncHandler.ts'
import type { AuthenticationRequest } from '../../middleware/auth.middleware.ts'
import { NotFoundError } from '../../middleware/errors.ts'
import { userPublicSchema } from './users.schema.ts'
import * as userService from './users.service.ts'

import { UnauthorizedError } from '../../middleware/errorHandler.ts'
import { verifyPassword } from '../auth/auth.utils.ts'
import type { UserPublicResponse, UserUpdateRequest } from './users.types.ts'

export const getProfile = asyncHandler(
  async (req: AuthenticationRequest, res: Response) => {
    const user = await userService.getById(req.user!.id)

    if (!user) throw new NotFoundError('User not found')

    const publicUser = z.parse(userPublicSchema, user)

    res.json({
      data: publicUser,
    } satisfies UserPublicResponse)
  },
)

export const updateProfile = asyncHandler(
  async (req: AuthenticationRequest, res: Response) => {
    const user = await userService.getById(req.user!.id)

    if (!user) throw new NotFoundError('User not found')

    const updatedUser = await userService.update(user.id, req.body)

    if (!updatedUser) throw new NotFoundError('User not found')

    const publicUser = z.parse(userPublicSchema, updatedUser)

    res.json({
      data: publicUser,
    } satisfies UserPublicResponse)
  },
)

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const payload: UserUpdateRequest = req.body

  const updatedUser = await userService.update(req.params.userId, payload)

  if (!updatedUser) throw new NotFoundError('User not found')

  res.json({
    data: {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    },
  } satisfies UserPublicResponse)
})

export const changePassword = asyncHandler(
  async (req: AuthenticationRequest, res) => {
    const user = req.user
    const { currentPassword, newPassword } = req.body

    if (!user) {
      throw new UnauthorizedError('You are unauthorized.')
    }

    const userDB = await userService.getById(user.id)

    if (!userDB) {
      throw new UnauthorizedError('You are unauthorized.')
    }

    const isValidPassword = await verifyPassword(
      currentPassword,
      userDB.password,
    )

    if (!isValidPassword) {
      throw new UnauthorizedError('Your current password is wrong.')
    }

    const updatedUser = await userService.updatePassword(user.id, newPassword)

    if (!updatedUser) throw new NotFoundError('User not found')

    res.json({
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    } satisfies UserPublicResponse)
  },
)

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const deletedUser = await userService.remove(req.params.userId)

  if (!deletedUser) throw new NotFoundError('User not found')
  res.status(204).send()
})
