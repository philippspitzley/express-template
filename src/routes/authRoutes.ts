import { Router } from 'express'

const router = Router()

router.post('/login', (req, res) => {
  res.json({ message: 'User logged in!' })
})

router.post('/register', (req, res) => {
  res.status(201).json({ message: 'User registered!' })
})

router.post('/logout', (req, res) => {
  res.json({ message: 'User logged out!' })
})

router.post('/refresh-token', (req, res) => {
  res.json({ message: 'Token refreshed!' })
})

export default router
