import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { isTest } from '../config/env.js'
import { login, logout, me, signup } from '../controllers/auth.js'

// Slow down brute-force password guessing on the two unauthenticated endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => isTest,
  message: { error: 'Too many attempts. Try again in a few minutes.' },
})

const router = Router()

router.post('/signup', authLimiter, signup)
router.post('/login', authLimiter, login)
router.post('/logout', logout)
router.get('/me', me)

export default router
