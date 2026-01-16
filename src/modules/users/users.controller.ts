import type { Request, Response } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler.ts'
import * as userService from './users.service.ts'

export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const users = await userService.getAll()
    res.json({ data: users })
  },
)

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getById(req.params.userId)
  res.json({ data: user })
})

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.create(req.body)
  res.status(201).json({ data: user })
})

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.update(req.params?.userId, req.body)
  res.json({ data: user })
})

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.remove(req.params.userId)
  res.status(204).send()
})
