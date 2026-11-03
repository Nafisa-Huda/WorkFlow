import type { Task } from '@/lib/types'

/** Query params for GET /api/tasks. Also used as part of the React Query cache key. */
export interface TaskFilter {
  listId?: string | 'none'
  status?: 'open' | 'completed' | 'all'
  dueFrom?: string
  dueTo?: string
  /** ISO datetimes; scheduledTo is exclusive. */
  scheduledFrom?: string
  scheduledTo?: string
}

/**
 * Client-side mirror of the server's task filter. Used to decide which cached
 * views an optimistically created task should appear in.
 */
export function matchesFilter(task: Task, filter: TaskFilter): boolean {
  if (filter.listId !== undefined) {
    const listId = filter.listId === 'none' ? null : filter.listId
    if (task.listId !== listId) return false
  }
  if (filter.status === 'open' && task.completedAt) return false
  if (filter.status === 'completed' && !task.completedAt) return false
  if (filter.dueFrom || filter.dueTo) {
    if (!task.dueDate) return false
    if (filter.dueFrom && task.dueDate < filter.dueFrom) return false
    if (filter.dueTo && task.dueDate > filter.dueTo) return false
  }
  if (filter.scheduledFrom || filter.scheduledTo) {
    if (!task.scheduledStart) return false
    const start = Date.parse(task.scheduledStart)
    if (filter.scheduledFrom && start < Date.parse(filter.scheduledFrom)) return false
    if (filter.scheduledTo && start >= Date.parse(filter.scheduledTo)) return false
  }
  return true
}
