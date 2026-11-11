import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from './api'

export const CURRENT_USER_KEY = ['currentUser']

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Retry network/server errors once; retrying a 4xx won't change the answer.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status < 500) && failureCount < 1,
    },
  },
  queryCache: new QueryCache({ onError: handleSessionExpiry }),
  mutationCache: new MutationCache({
    onError: (error, _input, _context, mutation) => {
      handleSessionExpiry(error)
      if (mutation.meta?.errorToast !== false) toast.error(error.message)
    },
  }),
})

// If the session expires mid-use, clear the user; RequireAuth then redirects to /login.
function handleSessionExpiry(error) {
  if (error instanceof ApiError && error.status === 401) {
    queryClient.setQueryData(CURRENT_USER_KEY, null)
  }
}
