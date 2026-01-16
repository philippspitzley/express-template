import type z from 'zod'
import type { users } from './users.model.ts'
import type { userCreateSchema, userUpdateSchema } from './users.schema.ts'

export type User = typeof users.$inferSelect

export type UserUpdate = z.infer<typeof userUpdateSchema>
export type UserCreate = z.infer<typeof userCreateSchema>
