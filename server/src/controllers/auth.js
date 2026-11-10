import { z } from 'zod'
import { HttpError } from '../lib/errors.js'
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

/** The user fields the client is allowed to see (never the password hash). */
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email })

/**
 * Signs a user in by storing their id in the session.
 * The session id is regenerated first, so a session id an attacker planted
 * before login can't be reused afterwards.
 */
function startSession(req, userId) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err)
      req.session.userId = userId
      resolve()
    })
  })
}

// POST /api/auth/signup
export async function signup(req, res) {
  const { name, email, password } = signupSchema.parse(req.body)

  if (await User.exists({ email })) {
    throw new HttpError(409, 'An account with that email already exists')
  }

  const user = await User.create({ name, email, passwordHash: await User.hashPassword(password) })
  await createDefaultLists(user._id)

  // Sign the new user in straight away.
  await startSession(req, user.id)
  res.status(201).json({ user: publicUser(user) })
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = loginSchema.parse(req.body)

  const user = await User.findOne({ email })
  if (!user || !(await user.verifyPassword(password))) {
    throw new HttpError(401, 'Invalid email or password')
  }

  await startSession(req, user.id)
  res.json({ user: publicUser(user) })
}

// POST /api/auth/logout
export function logout(req, res, next) {
  // Delete the session from MongoDB, then tell the browser to drop the cookie.
  req.session.destroy((err) => {
    if (err) return next(err)
    res.clearCookie(SESSION_COOKIE).status(204).end()
  })
}

// GET /api/auth/me
// "Who am I?" is a valid question when signed out, so answer with null rather than a 401.
export async function me(req, res) {
  const user = req.session.userId ? await User.findById(req.session.userId) : null
  res.json({ user: user ? publicUser(user) : null })
}
