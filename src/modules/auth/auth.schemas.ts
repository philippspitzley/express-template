import { createSelectSchema } from 'drizzle-zod'
import { userCreateSchema } from '../users/users.schema.ts'
import { refreshTokens } from './auth.model.ts'

export const refreshTokenSchema = createSelectSchema(refreshTokens)

export const emailLoginSchema = userCreateSchema.pick({
  email: true,
  password: true,
})
