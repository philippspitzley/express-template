import type { JWTPayload } from 'jose'
import type z from 'zod'
import type { UserPublic } from '../users/users.types.ts'
import type { emailLoginSchema, refreshTokenSchema } from './auth.schemas.ts'

export type RefreshToken = z.infer<typeof refreshTokenSchema>

export type EmailLoginParameters = z.infer<typeof emailLoginSchema>

export interface CustomJwtPayload extends JWTPayload {
  id: string
  email: string
  username: string
}

export type TokenResponse = { data: UserPublic; token: string }
