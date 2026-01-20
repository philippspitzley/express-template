import { Router } from 'express'

import { validateBody } from '../../middleware/validationHandler.ts'

import { userCreateSchema } from '../users/users.schema.ts'

import { loginHandler, registerHandler } from './auth.controller.ts'
import { emailLoginSchema } from './auth.schemas.ts'

const router = Router()

router.post('/register', validateBody(userCreateSchema), registerHandler)
router.post('/login', validateBody(emailLoginSchema), loginHandler)

router.post('/logout', (req, res) => {
  res.json({ message: 'User logged out!' })
})

router.post('/refresh-token', (req, res) => {
  res.json({ message: 'Token refreshed!' })
})

export default router
