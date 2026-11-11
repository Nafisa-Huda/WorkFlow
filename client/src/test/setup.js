import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// Give the first render in each test file time to load the app's modules.
configure({ asyncUtilTimeout: 5000 })
afterEach(() => cleanup())

// Browser APIs jsdom doesn't implement but the UI relies on (responsive sidebar, Radix).
// Defined directly (not vi.stubGlobal) so tests that unstub their fetch mocks keep them.
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})

window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
