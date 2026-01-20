import { Router } from 'express'

import {
  validateBody,
  validateParams,
} from '../../middleware/validationHandler.ts'

import {
  userCreateSchema,
  userIdParamsSchema,
  userUpdateSchema,
} from '../users/users.schema.ts'
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from './admin.users.controller.ts'

const router = Router()

router.param('userId', (req, res, next, userId) => {
  req.params.userId = userId
  return validateParams(userIdParamsSchema)(req, res, next)
})

router.get('/', getAllUsers)
router.get('/:userId', getUser)
router.post('/', validateBody(userCreateSchema), createUser)
router.patch('/:userId', validateBody(userUpdateSchema), updateUser)
router.delete('/:userId', deleteUser)

export default router
