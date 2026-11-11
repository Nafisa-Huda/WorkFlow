import { createBrowserRouter, Navigate } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { GuestOnly, RequireAuth } from '@/features/auth/guards'
import { LoginPage } from '@/features/auth/LoginPage'
import { SignupPage } from '@/features/auth/SignupPage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { InboxPage, ListPage, TodayPage, UpcomingPage } from '@/features/tasks/pages'
import { NotFoundPage, RouteErrorPage } from '@/pages/ErrorPages'
import { LandingPage } from '@/pages/LandingPage'

export const routes = [
  {
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/', element: <LandingPage /> },
      {
        // Login and signup: signed-in users are sent straight to the app.
        element: <GuestOnly />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/signup', element: <SignupPage /> },
        ],
      },
      {
        // Everything else needs a signed-in user.
        element: <RequireAuth />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: '/today', element: <TodayPage /> },
              { path: '/upcoming', element: <UpcomingPage /> },
              { path: '/inbox', element: <InboxPage /> },
              { path: '/lists/:listId', element: <ListPage /> },
              { path: '/calendar', element: <CalendarPage /> },
              { path: '/app', element: <Navigate to="/today" replace /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
