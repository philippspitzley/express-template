import dotenv from 'dotenv'
import { z } from 'zod'

process.env.APP_STAGE = process.env.APP_STAGE || 'development'

const isProduction = process.env.APP_STAGE === 'production'
const isDevelopment = process.env.APP_STAGE === 'development'
const isTesting = process.env.APP_STAGE === 'test'

if (isDevelopment) {
  dotenv.config({ path: '.env' })
} else if (isTesting) {
  dotenv.config({ path: '.env.test' })
}
const envStages = ['development', 'test', 'production'] as const
const envSchema = z.object({
  NODE_ENV: z.enum(envStages).default('development'),
  APP_STAGE: z.enum(envStages).default('development'),
  PORT: z.coerce.number().positive().default(3000),
  NEON_DATABASE_URL: z.string().startsWith('postgresql://').optional(),
  POSTGRES_VERSION: z.coerce.number().min(15).max(17).default(17),
  POSTGRES_USER: z.string().min(3).default('user'),
  POSTGRES_PASSWORD: z.string().min(3).default('secretpassword'),
  POSTGRES_HOST: z.string().min(3).default('localhost'),
  POSTGRES_DB: z.string().min(3),
  POSTGRES_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
  JWT_SECRET: z.string().min(32, 'Must be 32 chars long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(20).default(12),
  ALLOWED_ORIGINS: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>
let env: Env

try {
  env = envSchema.parse(process.env)
} catch (e) {
  if (e instanceof z.ZodError) {
    console.log('🚨 Invalid env var')
    console.error(z.prettifyError(e))

    process.exit(1)
  }

  throw e
}

// prefers neon db and falls back to POSTGRES_ variables
const DATABASE_URL =
  env.NEON_DATABASE_URL ||
  `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`

export const isProd = () => env.APP_STAGE === 'production'
export const isDev = () => env.APP_STAGE === 'development'
export const isTest = () => env.APP_STAGE === 'test'

const appEnv = { ...env, DATABASE_URL } as const
export type AppEnv = typeof appEnv

export { appEnv }
export default appEnv
