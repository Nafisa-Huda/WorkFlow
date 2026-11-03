import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { Priority, Task } from '@/lib/types'
import { matchesFilter, type TaskFilter } from './filters'

export const taskKeys = {
  all: ['tasks'] as const,
  list: (filter: TaskFilter) => ['tasks', filter] as const,
}

export const isTempTask = (task: Task) => task.id.startsWith('temp-')

export function useTasks(filter: TaskFilter) {
  return useQuery({
    queryKey: taskKeys.list(filter),
    queryFn: async ({ signal }) =>
      (await api<{ tasks: Task[] }>('/tasks', { query: { ...filter }, signal })).tasks,
  })
}

export interface NewTask {
  title: string
  notes?: string
  listId?: string | null
  priority?: Priority
  dueDate?: string | null
}

export type TaskChanges = Partial<
  Pick<Task, 'title' | 'notes' | 'listId' | 'priority' | 'dueDate'>
> & {
  completed?: boolean
}

// ---- Optimistic update helpers -------------------------------------------------
// Every task view (Today, Inbox, a list, the sidebar counts) is a separate cached
// query. Mutations patch all of them immediately, roll back on error, and refetch
// afterwards so the cache converges on what the server actually stored.

type Snapshot = Array<[readonly unknown[], Task[] | undefined]>

async function snapshotTasks(queryClient: QueryClient): Promise<Snapshot> {
  // Stop in-flight fetches from overwriting the optimistic state when they land.
  await queryClient.cancelQueries({ queryKey: taskKeys.all })
  return queryClient.getQueriesData<Task[]>({ queryKey: taskKeys.all })
}

function restore(queryClient: QueryClient, snapshot: Snapshot | undefined) {
  snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data))
}

function applyChanges(task: Task, { completed, ...changes }: TaskChanges): Task {
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
      const optimistic: Task = {
        id: `temp-${crypto.randomUUID()}`,
        notes: '',
        listId: null,
        priority: 'none',
        dueDate: null,
        scheduledStart: null,
        scheduledEnd: null,
        completedAt: null,
        order: 0,
        createdAt: now,
        updatedAt: now,
        ...input,
      }
      for (const [key, tasks] of snapshot) {
        const filter = (key[1] ?? {}) as TaskFilter
        if (tasks && matchesFilter(optimistic, filter)) {
          queryClient.setQueryData(key, [...tasks, optimistic])
        }
      }
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
      const snapshot = await snapshotTasks(queryClient)
      queryClient.setQueriesData<Task[]>({ queryKey: taskKeys.all }, (tasks) =>
        tasks?.map((t) => (t.id === id ? applyChanges(t, changes) : t)),
      )
      return { snapshot }
    },
    onError: (_error, _vars, context) => restore(queryClient, context?.snapshot),
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
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
            }),
        },
      })
    },
    onError: (_error, _task, context) => restore(queryClient, context?.snapshot),
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  })
}
