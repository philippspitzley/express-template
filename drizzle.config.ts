import { defineConfig } from 'drizzle-kit'
import { appEnv } from './env.ts'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: appEnv.DATABASE_URL,
  },
  verbose: true,
  strict: true,
})
