import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CalendarEvent } from '@/lib/types'

export interface EventRange {
  from: Date
  to: Date
}

export const eventKeys = {
  all: ['events'] as const,
  range: ({ from, to }: EventRange) =>
    ['events', { from: from.toISOString(), to: to.toISOString() }] as const,
  detail: (id: string) => ['event', id] as const,
}

/** Events overlapping a range. The client picks the range in local time, so "today" is the user's today. */
export function useEvents(range: EventRange) {
  return useQuery({
    queryKey: eventKeys.range(range),
    queryFn: async ({ signal }) =>
      (
        await api<{ events: CalendarEvent[] }>('/events', {
          query: { from: range.from.toISOString(), to: range.to.toISOString() },
          signal,
        })
      ).events,
  })
}

export function useEvent(id: string | null) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: eventKeys.detail(id ?? ''),
    queryFn: async ({ signal }) =>
      (await api<{ event: CalendarEvent }>(`/events/${id}`, { signal })).event,
    enabled: !!id,
    initialData: () => {
      for (const [, events] of queryClient.getQueriesData<CalendarEvent[]>({
        queryKey: eventKeys.all,
      })) {
        const event = events?.find((e) => e.id === id)
        if (event) return event
      }
    },
  })
}

export interface EventInput {
  title: string
  notes?: string
  start: string
  end: string
}

function useInvalidateEvents() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: eventKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['event'] }),
    ])
}

export function useCreateEvent() {
  const invalidate = useInvalidateEvents()
  return useMutation({
    mutationFn: async (input: EventInput) =>
      (await api<{ event: CalendarEvent }>('/events', { method: 'POST', body: input })).event,
    onSuccess: invalidate,
  })
}

export function useUpdateEvent() {
  const invalidate = useInvalidateEvents()
  return useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: Partial<EventInput> }) =>
      (await api<{ event: CalendarEvent }>(`/events/${id}`, { method: 'PATCH', body: changes }))
        .event,
    onSuccess: invalidate,
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateEvents()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/events/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: eventKeys.all })
      const snapshot = queryClient.getQueriesData<CalendarEvent[]>({ queryKey: eventKeys.all })
      queryClient.setQueriesData<CalendarEvent[]>({ queryKey: eventKeys.all }, (events) =>
        events?.filter((e) => e.id !== id),
      )
      return { snapshot }
    },
    onError: (_error, _id, context) =>
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data)),
    onSettled: invalidate,
  })
}
