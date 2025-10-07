import express from 'express'
import authRoutes from './routes/authRoutes.ts'
import userRoutes from './routes/userRoutes.ts'

const app = express()

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Routers
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

export { app }
export default app
