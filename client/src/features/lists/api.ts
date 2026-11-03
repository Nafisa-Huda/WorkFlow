import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { List, ListColor } from '@/lib/types'
import { taskKeys } from '@/features/tasks/api'

export const listKeys = { all: ['lists'] as const }

export function useLists() {
  return useQuery({
    queryKey: listKeys.all,
    queryFn: async () => (await api<{ lists: List[] }>('/lists')).lists,
  })
}

export function useCreateList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; color: ListColor }) =>
      (await api<{ list: List }>('/lists', { method: 'POST', body: input })).list,
    onSuccess: (list) =>
      queryClient.setQueryData<List[]>(listKeys.all, (lists = []) => [...lists, list]),
  })
}

export function useDeleteList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/lists/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<List[]>(listKeys.all, (lists = []) =>
        lists.filter((l) => l.id !== id),
      )
      // The server moved this list's tasks to the inbox.
      return queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}
