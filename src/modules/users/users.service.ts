import { eq } from 'drizzle-orm'

import db from '../../db/connection.ts'

import { hashPassword } from '../auth/auth.utils.ts'
import { users } from './users.model.ts'
import type { UserCreate, UserUpdateRequest } from './users.types.ts'

export const getAll = async () => {
  return await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
}

export const getById = async (id: string) => {
  const [user] = await db.select().from(users).where(eq(users.id, id))

  return user
}

export const getByEmail = async (email: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email))

  return user
}
export const getByUsername = async (email: string) => {
  const [user] = await db.select().from(users).where(eq(users.username, email))

  return user
}

export const create = async (user: UserCreate) => {
  const [createdUser] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning()

  return createdUser
}

export const update = async (id: string, userUpdate: UserUpdateRequest) => {
  const [updatedUser] = await db
    .update(users)
    .set(userUpdate)
    .where(eq(users.id, id))
    .returning()

  return updatedUser
}

export const updatePassword = async (id: string, password: string) => {
  const hashedPassword = await hashPassword(password)
  const [updatedUser] = await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, id))
    .returning()

  return updatedUser
}

export const remove = async (id: string) => {
  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning()

  return deletedUser
}
