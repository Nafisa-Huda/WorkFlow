import { vi } from 'vitest'

type Handler = (request: { url: URL; body: unknown }) => Response | Promise<Response>

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })

/**
 * Replaces fetch with route handlers keyed by "METHOD /path" (query string ignored).
 * Unhandled requests fail the test loudly instead of hanging.
 */
export function mockApi(routes: Record<string, Handler>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), 'http://localhost')
    const method = init?.method ?? 'GET'
    const handler = routes[`${method} ${url.pathname}`]
    if (!handler) throw new Error(`Unhandled request: ${method} ${url.pathname}`)
    const body = init?.body ? JSON.parse(String(init.body)) : undefined
    return handler({ url, body })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** A promise you resolve from the test, to hold a request "in flight". */
export function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => (resolve = r))
  return { promise, resolve }
}
