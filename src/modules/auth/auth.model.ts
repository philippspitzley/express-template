import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import users from '../users/users.model.ts'

export const refreshTokens = pgTable('refresh_tokens', {
  token: varchar('token').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
})
