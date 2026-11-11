import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { CURRENT_USER_KEY } from '@/lib/queryClient'

/** The signed-in user (from GET /api/auth/me), or null when signed out. */
export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: async () => (await api('/auth/me')).user,
    staleTime: Infinity, // only changes when we log in or out, which update it directly
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input) => api('/auth/login', { method: 'POST', body: input }),
    onSuccess: ({ user }) => queryClient.setQueryData(CURRENT_USER_KEY, user),
    meta: { errorToast: false }, // the form shows the error itself
  })
}

export function useSignup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input) => api('/auth/signup', { method: 'POST', body: input }),
    onSuccess: ({ user }) => queryClient.setQueryData(CURRENT_USER_KEY, user),
    meta: { errorToast: false },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      // Drop every cached query so the next user never sees this user's data.
      queryClient.clear()
      queryClient.setQueryData(CURRENT_USER_KEY, null)
    },
  })
}
