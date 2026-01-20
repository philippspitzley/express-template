import { Router } from 'express'
import adminUserRoutes from './admin.users.routes.ts'

const router = Router()

router.use('/', adminUserRoutes)

export default router
