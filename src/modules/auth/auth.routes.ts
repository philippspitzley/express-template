import { Router } from 'express'

import { validateBody } from '../../middleware/validationHandler.ts'

import { userCreateSchema } from '../users/users.schema.ts'

import {
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  registerHandler,
} from './auth.controller.ts'
import { emailLoginSchema } from './auth.schemas.ts'

const router = Router()

router.post('/register', validateBody(userCreateSchema), registerHandler)
router.post('/login', validateBody(emailLoginSchema), loginHandler)
router.post('/logout', logoutHandler)
router.post('/refresh-token', refreshTokenHandler)

export default router
