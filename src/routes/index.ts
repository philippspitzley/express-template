import { Router } from 'express'
import userRoutes from '../modules/users/users.routes.ts'
import authRoutes from './authRoutes.ts'

const router = Router()

router.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

router.use('/api/users', userRoutes)
router.use('/api/auth', authRoutes)

export default router
