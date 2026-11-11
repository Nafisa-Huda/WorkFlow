import { vi } from 'vitest'

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })

/**
 * Replaces fetch with route handlers keyed by "METHOD /path" (query string ignored).
 * Unhandled requests fail the test loudly instead of hanging.
 */
export function mockApi(routes) {
  const fetchMock = vi.fn(async (input, init) => {
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
