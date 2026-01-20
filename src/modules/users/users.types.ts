import type z from 'zod'
import type { users } from './users.model.ts'
import type {
  userChangePasswordSchema,
  userCreateSchema,
  userPublicSchema,
  userUpdateSchema,
} from './users.schema.ts'

// DB types
export type User = typeof users.$inferSelect
export type UserCreate = typeof users.$inferInsert

// Request types
export type UserCreateRequest = z.infer<typeof userCreateSchema>
export type UserUpdateRequest = z.infer<typeof userUpdateSchema>
export type UserUpdatePasswordRequest = z.infer<typeof userChangePasswordSchema>

// Response types
export type UserPublic = z.infer<typeof userPublicSchema>
export type UserPublicResponse = { data: UserPublic }
export type UsersPublicResponse = { data: UserPublic[] }
