import express from 'express'
import authRoutes from './routes/authRoutes.ts'
import userRoutes from './routes/userRoutes.ts'

const app = express()

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

export { app }
export default app
