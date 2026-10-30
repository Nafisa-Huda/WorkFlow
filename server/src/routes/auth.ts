import { Router, type Request } from 'express'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'
import passport from '../config/passport.js'
import { isTest } from '../config/env.js'
import { HttpError } from '../lib/errors.js'
import { requireAuth } from '../middleware/auth.js'
import { createDefaultLists } from '../models/List.js'
import { User } from '../models/User.js'

export const SESSION_COOKIE = 'wf.sid'

const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email'))

const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  email,
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
})

const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
})

// Slow down credential stuffing / brute force on the two unauthenticated endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => isTest,
  message: { error: 'Too many attempts. Try again in a few minutes.' },
})

function logIn(req: Request, user: Express.User) {
  return new Promise<void>((resolve, reject) =>
    req.login(user, (err) => (err ? reject(err) : resolve())),
  )
}

const router = Router()

router.post('/signup', authLimiter, async (req, res) => {
  const { name, email, password } = signupSchema.parse(req.body)

  if (await User.exists({ email })) {
    throw new HttpError(409, 'An account with that email already exists')
  }

  const user = await User.create({ name, email, passwordHash: await User.hashPassword(password) })
  await createDefaultLists(user._id)

  const sessionUser = { id: user.id, name: user.name, email: user.email }
  await logIn(req, sessionUser)
  res.status(201).json({ user: sessionUser })
})

router.post('/login', authLimiter, (req, res, next) => {
  req.body = loginSchema.parse(req.body)

  passport.authenticate(
    'local',
    async (err: unknown, user: Express.User | false, info?: { message: string }) => {
      try {
        if (err) throw err
        if (!user) throw new HttpError(401, info?.message ?? 'Invalid email or password')
        // req.login regenerates the session id, which prevents session fixation.
        await logIn(req, user)
        res.json({ user })
      } catch (error) {
        next(error)
      }
    },
  )(req, res, next)
})

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)
    req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr)
      res.clearCookie(SESSION_COOKIE).status(204).end()
    })
  })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

export default router
