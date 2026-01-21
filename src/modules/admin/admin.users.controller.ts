import type { Request, Response } from 'express'
import z from 'zod'
import { asyncHandler } from '../../middleware/asyncHandler.ts'
import { ConflictError, NotFoundError } from '../../middleware/errorHandler.ts'
import { hashPassword } from '../auth/auth.utils.ts'
import { userPublicSchema } from '../users/users.schema.ts'
import * as userService from '../users/users.service.ts'
import type {
  UserCreateRequest,
  UserPublicResponse,
  UserUpdateRequest,
} from '../users/users.types.ts'

export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const users = await userService.getAll()
    res.json({ data: users })
  },
)

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getById(req.params.userId)

  if (!user) throw new NotFoundError('User not found')

  const publicUser = z.parse(userPublicSchema, user)

  res.json({
    data: publicUser,
  } satisfies UserPublicResponse)
})

export const createUser = asyncHandler(async (req: Request, res: Response) => {
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

  const publicUser = z.parse(userPublicSchema, newUser)

  res.status(201).json({
    data: publicUser,
  } satisfies UserPublicResponse)
})

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const payload: UserUpdateRequest = req.body

  const updatedUser = await userService.update(req.params.userId, payload)

  if (!updatedUser) throw new NotFoundError('User not found')

  const publicUser = z.parse(userPublicSchema, updatedUser)

  res.json({
    data: publicUser,
  } satisfies UserPublicResponse)
})

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const deletedUser = await userService.remove(req.params.userId)

  if (!deletedUser) throw new NotFoundError('User not found')
  res.status(204).send()
})
