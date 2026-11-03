import { useSyncExternalStore } from 'react'

const MOBILE_BREAKPOINT = 768
const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

/** True below the md breakpoint. Subscribes to the media query instead of syncing it via an effect. */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
}
