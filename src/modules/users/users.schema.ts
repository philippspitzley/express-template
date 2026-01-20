import z from 'zod'

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod'
import users from './users.model.ts'

export const userSchema = createSelectSchema(users)

export const userPublicSchema = userSchema.omit({ password: true })

export const userCreateSchema = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .strict()

export const userUpdateSchema = createUpdateSchema(users)
  .omit({
    id: true,
    password: true,
    createdAt: true,
    updatedAt: true,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    error: 'You have to provide at least one updateble field',
  })

export const userIdParamsSchema = z.object({ userId: z.uuid() })

export const userChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(6).max(255),
    newPassword: z.string().min(6).max(255),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    error: 'You have to provide at least one updateble field',
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    error: 'Your newPassword cannot be your currentPassword',
  })
