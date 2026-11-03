import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

/**
 * Which task/event panel is open lives in the URL (?task=<id>, ?event=<id|new>),
 * so any part of the app (a list, the agenda, the command palette) can open one,
 * the back button closes it, and the link can be shared.
 */
export function useDetailParams() {
  const [params, setParams] = useSearchParams()

  const update = useCallback(
    (changes: Record<string, string | null>, replace = false) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(changes)) {
            if (value === null) next.delete(key)
            else next.set(key, value)
          }
          return next
        },
        { replace },
      ),
    [setParams],
  )

  return {
    taskId: params.get('task'),
    eventId: params.get('event'),
    /** Suggested start for a new event, as an ISO datetime. */
    eventStart: params.get('start'),
    openTask: useCallback((id: string) => update({ task: id, event: null }), [update]),
    closeTask: useCallback(() => update({ task: null }, true), [update]),
    openEvent: useCallback(
      (id: string) => update({ event: id, task: null, start: null }),
      [update],
    ),
    newEvent: useCallback(
      (start?: Date) => update({ event: 'new', task: null, start: start?.toISOString() ?? null }),
      [update],
    ),
    closeEvent: useCallback(() => update({ event: null, start: null }, true), [update]),
  }
}
