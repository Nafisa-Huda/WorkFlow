export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export const notFound = (resource = 'Resource') => new HttpError(404, `${resource} not found`)
export const unauthorized = () => new HttpError(401, 'Not authenticated')
