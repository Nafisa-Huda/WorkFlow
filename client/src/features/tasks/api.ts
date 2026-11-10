import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { Priority, Task } from '@/lib/types'
import { matchesFilter, type TaskFilter } from './filters'

export const taskKeys = {
  /** Prefix for every task-list query (each view caches its own filtered list). */
  all: ['tasks'] as const,
  list: (filter: TaskFilter) => ['tasks', filter] as const,
  detail: (id: string) => ['task', id] as const,
}

export const isTempTask = (task: Task) => task.id.startsWith('temp-')

export function useTasks(filter: TaskFilter) {
  return useQuery({
    queryKey: taskKeys.list(filter),
    queryFn: async ({ signal }) =>
      (await api<{ tasks: Task[] }>('/tasks', { query: { ...filter }, signal })).tasks,
  })
}

/** One task, e.g. for the detail sheet. Seeded from any list that already has it, so it opens instantly. */
export function useTask(id: string | null) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: taskKeys.detail(id ?? ''),
    queryFn: async ({ signal }) => (await api<{ task: Task }>(`/tasks/${id}`, { signal })).task,
    enabled: !!id && !id.startsWith('temp-'),
    initialData: () => (id ? findCachedTask(queryClient, id) : undefined),
  })
}

export interface NewTask {
  title: string
  notes?: string
  listId?: string | null
  priority?: Priority
  dueDate?: string | null
  scheduledStart?: string | null
  scheduledEnd?: string | null
}

export type TaskChanges = Partial<
  Pick<
    Task,
    'title' | 'notes' | 'listId' | 'priority' | 'dueDate' | 'scheduledStart' | 'scheduledEnd'
  >
> & {
  completed?: boolean
}

// ---- Optimistic update helpers -------------------------------------------------
// Every task view (Today, Inbox, a list, the agenda, the sidebar counts) is a
// separate cached query. Mutations patch all of them immediately, roll back on
// error, and refetch afterwards so the cache converges on what the server stored.

type Snapshot = Array<[readonly unknown[], Task[] | Task | undefined]>

async function snapshotTasks(queryClient: QueryClient, id?: string): Promise<Snapshot> {
  // Stop in-flight fetches from overwriting the optimistic state when they land.
  await queryClient.cancelQueries({ queryKey: taskKeys.all })
  const snapshot: Snapshot = queryClient.getQueriesData<Task[]>({ queryKey: taskKeys.all })
  if (id) snapshot.push([taskKeys.detail(id), queryClient.getQueryData(taskKeys.detail(id))])
  return snapshot
}

function restore(queryClient: QueryClient, snapshot: Snapshot | undefined) {
  snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data))
}

function findCachedTask(queryClient: QueryClient, id: string): Task | undefined {
  for (const [, tasks] of queryClient.getQueriesData<Task[]>({ queryKey: taskKeys.all })) {
    const task = tasks?.find((t) => t.id === id)
    if (task) return task
  }
  return queryClient.getQueryData<Task>(taskKeys.detail(id))
}

/**
 * Writes a task into every cached view: replaces it where it already is, and
 * adds it to views it now belongs in (e.g. dragging a task onto the agenda).
 * Views it no longer matches keep it until the refetch, so it doesn't vanish
 * mid-interaction (a just-completed task stays visible, struck through).
 */
function writeTask(queryClient: QueryClient, task: Task) {
  for (const [key, tasks] of queryClient.getQueriesData<Task[]>({ queryKey: taskKeys.all })) {
    if (!tasks) continue
    const filter = (key[1] ?? {}) as TaskFilter
    const index = tasks.findIndex((t) => t.id === task.id)
    if (index >= 0) {
      queryClient.setQueryData(key, tasks.with(index, task))
    } else if (matchesFilter(task, filter)) {
      queryClient.setQueryData(key, [...tasks, task])
    }
  }
  if (queryClient.getQueryData(taskKeys.detail(task.id))) {
    queryClient.setQueryData(taskKeys.detail(task.id), task)
  }
}

export function applyChanges(task: Task, { completed, ...changes }: TaskChanges): Task {
  const next = { ...task, ...changes }
  if (completed !== undefined) {
    next.completedAt = completed ? (task.completedAt ?? new Date().toISOString()) : null
  }
  return next
}

// ---- Mutations ------------------------------------------------------------------

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: NewTask) =>
      (await api<{ task: Task }>('/tasks', { method: 'POST', body: input })).task,
    onMutate: async (input) => {
      const snapshot = await snapshotTasks(queryClient)
      const now = new Date().toISOString()
      writeTask(queryClient, {
        id: `temp-${crypto.randomUUID()}`,
        notes: '',
        listId: null,
        priority: 'none',
        dueDate: null,
        scheduledStart: null,
        scheduledEnd: null,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
        ...input,
      })
      return { snapshot }
    },
    onError: (_error, _input, context) => restore(queryClient, context?.snapshot),
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: TaskChanges }) =>
      (await api<{ task: Task }>(`/tasks/${id}`, { method: 'PATCH', body: changes })).task,
    onMutate: async ({ id, changes }) => {
      const snapshot = await snapshotTasks(queryClient, id)
      const current = findCachedTask(queryClient, id)
      if (current) writeTask(queryClient, applyChanges(current, changes))
      return { snapshot }
    },
    onError: (_error, _vars, context) => restore(queryClient, context?.snapshot),
    onSettled: (_data, _error, { id }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: taskKeys.all }),
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) }),
      ]),
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  const createTask = useCreateTask()

  return useMutation({
    mutationFn: (task: Task) => api<void>(`/tasks/${task.id}`, { method: 'DELETE' }),
    onMutate: async (task) => {
      const snapshot = await snapshotTasks(queryClient)
      queryClient.setQueriesData<Task[]>({ queryKey: taskKeys.all }, (tasks) =>
        tasks?.filter((t) => t.id !== task.id),
      )
      return { snapshot }
    },
    onSuccess: (_data, task) => {
      queryClient.removeQueries({ queryKey: taskKeys.detail(task.id) })
      toast('Task deleted', {
        duration: 6000,
        action: {
          label: 'Undo',
          onClick: () =>
            createTask.mutate({
              title: task.title,
              notes: task.notes,
              listId: task.listId,
              priority: task.priority,
              dueDate: task.dueDate,
              scheduledStart: task.scheduledStart,
              scheduledEnd: task.scheduledEnd,
            }),
        },
      })
    },
    onError: (_error, _task, context) => restore(queryClient, context?.snapshot),
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  })
}
