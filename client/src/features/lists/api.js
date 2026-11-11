import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useLists() {
  return useQuery({
    queryKey: ['lists'],
    queryFn: async () => (await api('/lists')).lists,
  })
}

export function useCreateList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input) => (await api('/lists', { method: 'POST', body: input })).list,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  })
}

export function useUpdateList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, changes }) =>
      (await api(`/lists/${id}`, { method: 'PATCH', body: changes })).list,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  })
}

export function useDeleteList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api(`/lists/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      // The server moved this list's tasks to the inbox.
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
