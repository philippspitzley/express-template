import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '../modules/users/users.model.ts'
import { isProd, appEnv } from '../../env.ts'
import { remember } from '@epic-web/remember'
import postgres from 'postgres'

const createDb = () => {
  const client = postgres(appEnv.DATABASE_URL)
  return drizzle(client, {
    schema,
  })
}

export const db = isProd() ? createDb() : remember('db', () => createDb())

export default db
