import { unauthorized } from '../lib/errors.js'

/**
 * Blocks the request with a 401 unless the user is signed in.
 * Signing in stores the user's id in the session (see controllers/auth.js),
 * so routes behind this can rely on req.session.userId.
 */
export function requireAuth(req, _res, next) {
  if (!req.session.userId) throw unauthorized()
  next()
}
