import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// Routes are lazy-loaded, so the first render in a file waits for module transforms.
configure({ asyncUtilTimeout: 5000 })
afterEach(() => cleanup())

// Browser APIs jsdom doesn't implement but the UI relies on (responsive sidebar, Radix).
// Defined directly (not vi.stubGlobal) so tests that unstub their fetch mocks keep them.
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList

window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
