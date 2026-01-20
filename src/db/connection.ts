import { remember } from '@epic-web/remember'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { appEnv, isProd } from '../../env.ts'
import * as schema from '../modules/users/users.model.ts'

const createDb = () => {
  const client = postgres(appEnv.DATABASE_URL)
  return drizzle(client, {
    schema,
  })
}

export const db = isProd() ? createDb() : remember('db', () => createDb())

export default db
