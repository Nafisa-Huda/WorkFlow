import mongoose from 'mongoose'
import { ZodError, z } from 'zod'

/**
 * Every error ends up here (Express 5 forwards errors thrown in async handlers
 * automatically), so clients always get the same JSON shape:
 * { error: string, fields?: { [field]: string[] } }
 *
 * Express recognises an error handler by its 4 arguments, so _next stays even though it's unused.
 */
export function errorHandler(err, _req, res, _next) {
  // Request body / query failed zod validation.
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ error: 'Validation failed', fields: z.flattenError(err).fieldErrors })
  }

  // A Mongoose schema rule failed, e.g. a task scheduled to end before it starts.
  if (err instanceof mongoose.Error.ValidationError) {
    const fields = {}
    for (const [path, e] of Object.entries(err.errors)) fields[path] = [e.message]
    return res.status(400).json({ error: 'Validation failed', fields })
  }

  // A malformed id, e.g. GET /api/tasks/not-an-id.
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: 'Invalid id' })
  }

  // Errors that carry their own status: our HttpErrors (404, 401...) and
  // Express's own request errors (malformed JSON, body too large).
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: err.message })
  }

  // Anything else is a bug: log it, but don't leak details to the client.
  console.error(err)
  return res.status(500).json({ error: 'Something went wrong' })
}
