import { userCreateSchema } from '../users/users.schema.ts'

export const emailLoginSchema = userCreateSchema.pick({
  email: true,
  password: true,
})
