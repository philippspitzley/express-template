import { eq } from 'drizzle-orm'

import db from '../../db/connection.ts'
import { NotFoundError } from '../../errors.ts'

import { users } from './users.model.ts'
import type { UserCreate, UserUpdate } from './users.types.ts'

const publicUserFields = {
  id: users.id,
  email: users.email,
  firstName: users.firstName,
  lastName: users.lastName,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
} as const

export const getAll = async () => {
  return await db.select(publicUserFields).from(users)
}

export const getById = async (id: string) => {
  const [user] = await db
    .select(publicUserFields)
    .from(users)
    .where(eq(users.id, id))

  if (!user) throw new NotFoundError('User not found')

  return user
}

export const create = async (payload: UserCreate) => {
  const [createdUser] = await db
    .insert(users)
    .values(payload)
    .returning(publicUserFields)

  if (!createdUser) throw new NotFoundError('User not found')

  return createdUser
}

export const update = async (id: string, payload: UserUpdate) => {
  const [updatedUser] = await db
    .update(users)
    .set(payload)
    .where(eq(users.id, id))
    .returning(publicUserFields)

  if (!updatedUser) throw new NotFoundError('User not found')

  return updatedUser
}

export const remove = async (id: string) => {
  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning(publicUserFields)

  if (!deletedUser) throw new NotFoundError('User not found')

  return deletedUser
}
