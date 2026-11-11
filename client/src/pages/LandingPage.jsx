import { ArrowRight, CalendarDays, CheckCircle2, Timer } from 'lucide-react'
import { Link } from 'react-router'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/features/auth/api'

const FEATURES = [
  {
    icon: CheckCircle2,
    title: 'Capture everything',
    body: 'Add a task in a keystroke. Sort it into lists, give it a due date, and let Today show what matters now.',
  },
  {
    icon: CalendarDays,
    title: 'See your whole day',
    body: 'Drag tasks onto a timeline to block out your day, and see the month at a glance on the calendar.',
  },
  {
    icon: Timer,
    title: 'Then focus',
    body: 'A built-in focus timer keeps you on one thing at a time: 25 minutes of work, then a short break.',
  },
]

export function LandingPage() {
  const { data: user } = useCurrentUser()

  return (
    <div className="min-h-svh bg-gradient-to-b from-primary/5 via-background to-background">
      <title>WorkFlow · Plan your day, then focus on it</title>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          {user ? (
            <Button asChild>
              <Link to="/today">Open WorkFlow</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="py-20 text-center sm:py-28">
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Plan your day, <span className="text-primary">then focus on it.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
            WorkFlow brings your tasks, calendar, and focus time into one calm view, so you always
            know what to work on next.
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <Button size="lg" asChild>
              <Link to={user ? '/today' : '/signup'}>
                {user ? 'Go to Today' : 'Start planning, free'}
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 pb-24 sm:grid-cols-3" aria-label="Features">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border bg-card p-6">
              <Icon className="size-5 text-primary" aria-hidden />
              <h2 className="mt-4 font-medium">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} WorkFlow
      </footer>
    </div>
  )
}
