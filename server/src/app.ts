import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import MongoStore from 'connect-mongo'
import express from 'express'
import session from 'express-session'
import helmet from 'helmet'
import mongoose from 'mongoose'
import morgan from 'morgan'
import { env, isProduction, isTest } from './config/env.js'
import passport from './config/passport.js'
import { notFound } from './lib/errors.js'
import { errorHandler } from './middleware/errorHandler.js'
import authRoutes, { SESSION_COOKIE } from './routes/auth.js'
import eventRoutes from './routes/events.js'
import focusSessionRoutes from './routes/focusSessions.js'
import listRoutes from './routes/lists.js'
import taskRoutes from './routes/tasks.js'

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist')

/** Builds the Express app. Expects mongoose to be connected (the session store reuses its client). */
export function createApp() {
  const app = express()

  // Behind a proxy (Render/Railway), needed so secure cookies are set over HTTPS.
  if (isProduction) app.set('trust proxy', 1)

  app.use(helmet())
  app.use(express.json({ limit: '100kb' }))
  if (!isTest) app.use(morgan(isProduction ? 'combined' : 'dev'))

  app.use(
    session({
      name: SESSION_COOKIE,
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ client: mongoose.connection.getClient() }),
      cookie: {
        httpOnly: true,
        // Lax cookies + a JSON-only API means cross-site form posts can't act as the user (CSRF).
        sameSite: 'lax',
        secure: isProduction,
        maxAge: THIRTY_DAYS,
      },
    }),
  )
  app.use(passport.initialize())
  app.use(passport.session())

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })
  app.use('/api/auth', authRoutes)
  app.use('/api/tasks', taskRoutes)
  app.use('/api/lists', listRoutes)
  app.use('/api/events', eventRoutes)
  app.use('/api/focus-sessions', focusSessionRoutes)
  app.use('/api', () => {
    throw notFound('Endpoint')
  })

  // In production the API also serves the built React app, so everything is one origin.
  if (isProduction && existsSync(clientDist)) {
    app.use(express.static(clientDist))
    app.get('/{*splat}', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')))
  }

  app.use(errorHandler)
  return app
}
