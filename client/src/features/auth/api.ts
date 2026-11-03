import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { meQueryKey } from '@/lib/queryClient'
import type { User } from '@/lib/types'

/** The signed-in user, or null when signed out. */
export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: async () => (await api<{ user: User | null }>('/auth/me')).user,
    staleTime: Infinity,
  })
}

export interface LoginInput {
  email: string
  password: string
}

export interface SignupInput extends LoginInput {
  name: string
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: LoginInput) =>
      api<{ user: User }>('/auth/login', { method: 'POST', body: input }),
    onSuccess: ({ user }) => queryClient.setQueryData(meQueryKey, user),
    meta: { errorToast: false },
  })
}

export function useSignup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SignupInput) =>
      api<{ user: User }>('/auth/signup', { method: 'POST', body: input }),
    onSuccess: ({ user }) => queryClient.setQueryData(meQueryKey, user),
    meta: { errorToast: false },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api<void>('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      // Drop every cached query so the next user never sees this user's data.
      queryClient.clear()
      queryClient.setQueryData(meQueryKey, null)
    },
  })
}
