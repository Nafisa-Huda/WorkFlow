import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

/**
 * Which task's detail panel is open lives in the URL (?task=<id>), so any part
 * of the app (a list, the agenda, the calendar) can open one, the back button
 * closes it, and the link can be shared.
 */
export function useDetailParams() {
  const [params, setParams] = useSearchParams()

  const update = useCallback(
    (task: string | null, replace = false) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (task === null) next.delete('task')
          else next.set('task', task)
          return next
        },
        { replace },
      ),
    [setParams],
  )

  return {
    taskId: params.get('task'),
    openTask: useCallback((id: string) => update(id), [update]),
    closeTask: useCallback(() => update(null, true), [update]),
  }
}
