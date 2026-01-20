import { Router } from 'express'

import { authenticate } from '../../middleware/auth.middleware.ts'
import { validateBody } from '../../middleware/validationHandler.ts'
import {
  changePassword,
  getProfile,
  updateProfile,
} from './users.controller.ts'
import { userChangePasswordSchema, userUpdateSchema } from './users.schema.ts'

const router = Router()

router.use('/', authenticate)

router.get('/', getProfile)
router.patch('/', validateBody(userUpdateSchema), updateProfile)
router.patch(
  '/password',
  validateBody(userChangePasswordSchema),
  changePassword,
)
// router.delete('/profile', deleteProfile)

export default router
