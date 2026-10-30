import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { ZodError, z } from 'zod'
import { HttpError } from '../lib/errors.js'

/**
 * Every error ends up here (Express 5 forwards rejected promises from async
 * handlers automatically), so clients always get a JSON body:
 * { error: string, fields?: Record<string, string[]> }
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ error: 'Validation failed', fields: z.flattenError(err).fieldErrors })
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const fields = Object.fromEntries(
      Object.entries(err.errors).map(([path, e]) => [path, [e.message]]),
    )
    return res.status(400).json({ error: 'Validation failed', fields })
  }

  // Unique index violation, e.g. two signups racing for the same email.
  if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
    return res.status(409).json({ error: 'Already exists' })
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message })
  }

  // Malformed JSON body from express.json()
  if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    return res.status(400).json({ error: 'Malformed JSON body' })
  }

  console.error(err)
  return res.status(500).json({ error: 'Something went wrong' })
}
