import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'

// Every task query's key starts with 'tasks', so one invalidate refreshes them all.

/** Tasks matching a filter, e.g. { listId: 'none' } for the inbox. The filter becomes the query string. */
export function useTasks(filter) {
  return useQuery({
    queryKey: ['tasks', filter],
    queryFn: async () => (await api('/tasks', { query: filter })).tasks,
  })
}

/** One task, for the detail panel. */
export function useTask(id) {
  return useQuery({
    queryKey: ['tasks', 'detail', id],
    queryFn: async () => (await api(`/tasks/${id}`)).task,
    enabled: !!id,
  })
}

/** After any change, refetch every task view on screen so they all show what the server saved. */
function useRefreshTasks() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
}

export function useCreateTask() {
  const refreshTasks = useRefreshTasks()
  return useMutation({
    mutationFn: async (input) => (await api('/tasks', { method: 'POST', body: input })).task,
    onSuccess: refreshTasks,
  })
}

export function useUpdateTask() {
  const refreshTasks = useRefreshTasks()
  return useMutation({
    mutationFn: async ({ id, changes }) =>
      (await api(`/tasks/${id}`, { method: 'PATCH', body: changes })).task,
    onSuccess: refreshTasks,
  })
}

export function useDeleteTask() {
  const refreshTasks = useRefreshTasks()
  const createTask = useCreateTask()

  return useMutation({
    mutationFn: (task) => api(`/tasks/${task.id}`, { method: 'DELETE' }),
    onSuccess: (_data, task) => {
      refreshTasks()
      // Undo re-creates the task from the copy we still have.
      toast('Task deleted', {
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
  })
}
