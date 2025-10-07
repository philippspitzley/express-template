import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema.ts'
import { env, isProd } from '../../env.ts'
import { remember } from '@epic-web/remember'
import postgres from 'postgres'

const createDb = () => {
  const client = postgres(env.DATABASE_URL)
  return drizzle(client, {
    schema,
  })
}

export const db = isProd() ? createDb() : remember('db', () => createDb())

export default db
