import { Link, isRouteErrorResponse, useRouteError } from 'react-router'
import { Button } from '@/components/ui/button'

function Message({ title, body }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <title>{`${title} · WorkFlow`}</title>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="max-w-sm text-muted-foreground">{body}</p>
      <Button asChild>
        <Link to="/">Back to WorkFlow</Link>
      </Button>
    </main>
  )
}

export function NotFoundPage() {
  return (
    <Message
      title="Page not found"
      body="The page you're looking for doesn't exist or has moved."
    />
  )
}

/** Router-level error boundary: a render error shows this instead of a blank screen. */
export function RouteErrorPage() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />
  console.error(error)
  return (
    <Message
      title="Something went wrong"
      body="An unexpected error occurred. Try reloading the page."
    />
  )
}
