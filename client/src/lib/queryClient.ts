import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from './api'

export const meQueryKey = ['me'] as const

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** Set false when the UI shows the error itself (e.g. inline form errors). */
      errorToast?: boolean
    }
  }
}

export const queryClient: QueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Retrying a 4xx won't change the answer.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status < 500) && failureCount < 2,
    },
  },
  queryCache: new QueryCache({ onError: handleSessionExpiry }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      handleSessionExpiry(error)
      if (mutation.meta?.errorToast !== false) toast.error(error.message)
    },
  }),
})

// If the session expires mid-use, clear the user; RequireAuth then redirects to /login.
function handleSessionExpiry(error: Error) {
  if (error instanceof ApiError && error.status === 401) {
    queryClient.setQueryData(meQueryKey, null)
  }
}
