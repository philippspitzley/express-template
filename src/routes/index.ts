import { Router } from 'express'
import adminRoutes from '../modules/admin/admin.routes.ts'
import authRoutes from '../modules/auth/auth.routes.ts'
import userRoutes from '../modules/users/users.routes.ts'

const router = Router()

router.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

router.use('/api/users/profile', userRoutes)
router.use('/api/auth', authRoutes)
router.use('/api/users', adminRoutes)
export default router
