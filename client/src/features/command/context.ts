import { createContext, use } from 'react'

export const CommandPaletteContext = createContext<{ open: () => void } | null>(null)

export function useCommandPalette() {
  const context = use(CommandPaletteContext)
  if (!context) throw new Error('useCommandPalette must be used inside CommandPaletteProvider')
  return context
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
export const shortcutLabel = isMac ? '⌘K' : 'Ctrl K'
