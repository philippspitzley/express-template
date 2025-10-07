import { db } from './connection.ts'
import { users, type User } from './schema.ts'
import { isProd } from '../../env.ts'

const seed = async () => {
  // Prevent accidental seeding in production
  if (isProd()) {
    console.error('❌ Cannot seed database in production')
    process.exit(1)
  }

  console.log('🌱 Seeding database...')

  try {
    console.log('🧼 Clearing existing data...')
    await db.delete(users)

    console.log('➕ Inserting seed data...')
    const [demoUser]: User[] = await db
      .insert(users)
      .values({
        email: 'demo@app.com',
        password: 'password',
        lastName: 'User',
      })
      .returning()

    console.log('Inserted user:', demoUser)
    console.log('✅ Database seeded successfully')
  } catch (e) {
    console.error('❌ Seeding database failed:', e)
    throw e // Let caller handle exit
  }
}

export default seed

// Run if executed directly
if (import.meta.url.endsWith(process.argv[1])) {
  await seed()
  process.exit(0)
}
