import { seed } from 'drizzle-seed'
import { isProd } from '../../env.ts'
import { db } from './connection.ts'
import { users } from './schema.ts'

const seedDB = async () => {
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
    await seed(db, { users }, { count: 10000 }).refine((funcs) => ({
      users: {
        columns: {
          // set id to undefined and let db generate id
          id: funcs.default({ defaultValue: undefined }),
        },
      },
    }))

    console.log('✅ Database seeded successfully')
  } catch (error) {
    console.error('🚨 Seeding database failed:', error)
    throw error // Let caller handle exit
  }
}

export default seedDB

// Run if executed directly
if (import.meta.url.endsWith(process.argv[1])) {
  await seedDB()
  process.exit(0)
}
