import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json({ message: 'Get all users!' })
})

router.get('/:id', (req, res) => {
  const { id } = req.params
  res.json({ message: `Get user with ID: ${id}` })
})

router.post('/', (req, res) => {
  res.json({ message: 'Create a new user!' }).status(201)
})

router.patch('/:id', (req, res) => {
  const { id } = req.params
  res.json({ message: `Partially update user with ID: ${id}` })
})

router.delete('/:id', (req, res) => {
  const { id } = req.params
  res.json({ message: `Delete user with ID: ${id}` }).status(204)
})

export default router
