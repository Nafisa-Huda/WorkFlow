/** An error with an HTTP status code. Throw it anywhere; the error handler turns it into a response. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

export const notFound = (resource = 'Resource') => new HttpError(404, `${resource} not found`)
export const unauthorized = () => new HttpError(401, 'Not authenticated')
