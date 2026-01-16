import z from 'zod'

export const userParamsSchema = z.object({ userId: z.uuid() })

export const userUpdateSchema = z
  .object({
    email: z.email().optional(),
    password: z.string().min(8).max(100).optional(),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'You have to provide at least one updateble field',
  })

export const userCreateSchema = z
  .object({
    email: z.email(),
    password: z.string().min(8).max(100),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
  })
  .strict()
