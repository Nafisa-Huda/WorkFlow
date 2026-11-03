export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fields?: Record<string, string[] | undefined>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type Query = Record<string, string | number | boolean | null | undefined>

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Query
  signal?: AbortSignal
}

/**
 * Thin fetch wrapper for the JSON API. Same-origin (Vite proxies /api in dev),
 * so the session cookie is sent automatically. Throws ApiError on non-2xx.
 */
export async function api<T>(
  path: string,
  { method = 'GET', body, query, signal }: RequestOptions = {},
) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) params.set(key, String(value))
  }
  const qs = params.size ? `?${params}` : ''

  const res = await fetch(`/api${path}${qs}`, {
    method,
    signal,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (res.status === 204) return undefined as T

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? res.statusText, data?.fields)
  }
  return data as T
}
