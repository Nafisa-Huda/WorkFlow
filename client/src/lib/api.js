export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message)
    this.status = status
    this.fields = fields // per-field validation messages, e.g. { email: ['Enter a valid email'] }
  }
}

/**
 * Calls the JSON API and returns the parsed response, or throws an ApiError.
 * Requests go to the same origin (Vite forwards /api to the server in development),
 * so the browser sends the session cookie automatically.
 */
export async function api(path, { method = 'GET', body, query = {} } = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) params.set(key, value)
  }
  const queryString = params.size ? `?${params}` : ''

  const res = await fetch(`/api${path}${queryString}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (res.status === 204) return undefined // No Content, e.g. after a delete

  const data = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, data?.error ?? res.statusText, data?.fields)
  return data
}
