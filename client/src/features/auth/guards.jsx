import { Navigate, Outlet, useLocation } from 'react-router'
import { FullPageSpinner } from '@/components/FullPageSpinner'
import { useCurrentUser } from './api'

/** Renders child routes only for signed-in users; otherwise sends them to /login. */
export function RequireAuth() {
  const { data: user, isPending } = useCurrentUser()
  const location = useLocation()

  if (isPending) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Login/signup pages: signed-in users go straight to the app. */
export function GuestOnly() {
  const { data: user, isPending } = useCurrentUser()

  if (isPending) return <FullPageSpinner />
  if (user) return <Navigate to="/today" replace />
  return <Outlet />
}
