import { useSearchParams } from 'react-router'

/**
 * The open task lives in the URL (?task=<id>), so any page (a list, the agenda,
 * the calendar) can open its details, the back button closes them, and the link can be shared.
 */
export function useOpenTask() {
  const [params, setParams] = useSearchParams()

  const openTask = (id) =>
    setParams((prev) => {
      prev.set('task', id)
      return prev
    })

  const closeTask = () =>
    setParams(
      (prev) => {
        prev.delete('task')
        return prev
      },
      { replace: true },
    )

  return { taskId: params.get('task'), openTask, closeTask }
}
