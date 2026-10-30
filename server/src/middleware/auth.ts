import type { NextFunction, Request, Response } from 'express'
import { unauthorized } from '../lib/errors.js'

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) throw unauthorized()
  next()
}

/** The signed-in user's id. Only call from routes behind requireAuth. */
export function userId(req: Request): string {
  if (!req.user) throw unauthorized()
  return req.user.id
}
