import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { FullPageSpinner } from '@/components/FullPageSpinner'
import { GuestOnly, RequireAuth } from '@/features/auth/guards'
import { NotFoundPage, RouteErrorPage } from '@/pages/ErrorPages'
import { LandingPage } from '@/pages/LandingPage'

// Route-level code splitting: the landing page ships without the app, and the
// app (sidebar, task views, forms) loads only once someone signs in.
const tasksPage = (name: keyof typeof import('@/features/tasks/pages')) => async () => ({
  Component: (await import('@/features/tasks/pages'))[name],
})

export const routes: RouteObject[] = [
  {
    errorElement: <RouteErrorPage />,
    // Shown while a lazy route's code loads on the first page load.
    HydrateFallback: FullPageSpinner,
    children: [
      { path: '/', element: <LandingPage /> },
      {
        element: <GuestOnly />,
        children: [
          {
            path: '/login',
            lazy: async () => ({
              Component: (await import('@/features/auth/LoginPage')).LoginPage,
            }),
          },
          {
            path: '/signup',
            lazy: async () => ({
              Component: (await import('@/features/auth/SignupPage')).SignupPage,
            }),
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            lazy: async () => ({
              Component: (await import('@/components/layout/AppShell')).AppShell,
            }),
            children: [
              { path: '/today', lazy: tasksPage('TodayPage') },
              { path: '/upcoming', lazy: tasksPage('UpcomingPage') },
              { path: '/inbox', lazy: tasksPage('InboxPage') },
              { path: '/lists/:listId', lazy: tasksPage('ListPage') },
              {
                path: '/calendar',
                lazy: async () => ({
                  Component: (await import('@/features/calendar/CalendarPage')).CalendarPage,
                }),
              },
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
