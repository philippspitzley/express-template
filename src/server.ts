import express from 'express'
import authRoutes from './routes/authRoutes.ts'
import userRoutes from './routes/userRoutes.ts'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import { env } from '../env.ts'

const app = express()

// Middleware
app.use(helmet()) // Security headers
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
  })
) // CORS policy
app.use(express.json()) // Parse JSON bodies
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies
app.use(morgan('dev')) // Logging

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Routers
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

export { app }
export default app
