import { format, parseISO } from 'date-fns'
import { Navigate, useParams } from 'react-router'
import { useLists } from '@/features/lists/api'
import { formatDayHeading, todayKey, tomorrowKey } from '@/lib/dates'
import type { Task } from '@/lib/types'
import { useTasks } from './api'
import { TaskView, type TaskSection } from './TaskView'

const isOpen = (t: Task) => !t.completedAt
const isDone = (t: Task) => !!t.completedAt

export function TodayPage() {
  const today = todayKey()
  const query = useTasks({ dueTo: today })
  const tasks = query.data ?? []

  // Completed tasks stay visible today if they were due today or finished today,
  // so checking something off feels rewarding instead of making it vanish.
  const completed = tasks.filter(
    (t) => isDone(t) && (t.dueDate === today || isLocalToday(t.completedAt!)),
  )

  return (
    <TaskView
      title="Today"
      subtitle={format(new Date(), 'EEEE, MMMM d')}
      query={query}
      sections={[
        {
          id: 'overdue',
          title: 'Overdue',
          tone: 'danger',
          tasks: tasks.filter((t) => isOpen(t) && t.dueDate! < today),
        },
        {
          id: 'today',
          tasks: tasks.filter((t) => isOpen(t) && t.dueDate === today),
          hideDue: true,
        },
      ]}
      completed={completed}
      composerDefaults={{ dueDate: today }}
      empty="Nothing due today. Add a task above, or plan ahead in Upcoming."
    />
  )
}

export function UpcomingPage() {
  const query = useTasks({ dueFrom: tomorrowKey(), status: 'open' })
  const byDay = Map.groupBy(query.data ?? [], (t) => t.dueDate!)
  const sections: TaskSection[] = [...byDay.keys()].sort().map((day) => ({
    id: day,
    title: formatDayHeading(day),
    tasks: byDay.get(day)!,
    hideDue: true,
  }))

  return (
    <TaskView
      title="Upcoming"
      subtitle="Everything with a due date after today."
      query={query}
      sections={sections}
      composerDefaults={{ dueDate: tomorrowKey() }}
      empty="Nothing scheduled yet. Tasks with a future due date show up here."
    />
  )
}

export function InboxPage() {
  const query = useTasks({ listId: 'none' })
  const tasks = query.data ?? []

  return (
    <TaskView
      title="Inbox"
      subtitle="Tasks that aren't in a list yet."
      query={query}
      sections={[{ id: 'open', tasks: tasks.filter(isOpen) }]}
      completed={tasks.filter(isDone)}
      composerDefaults={{ listId: null }}
      showList={false}
      empty="Your inbox is empty. Capture anything here and sort it later."
    />
  )
}

export function ListPage() {
  const { listId = '' } = useParams()
  const { data: lists, isPending } = useLists()
  const query = useTasks({ listId })
  const list = lists?.find((l) => l.id === listId)
  const tasks = query.data ?? []

  if (!isPending && !list) return <Navigate to="/inbox" replace />

  return (
    <TaskView
      title={list?.name ?? ''}
      query={query}
      sections={[{ id: 'open', tasks: tasks.filter(isOpen) }]}
      completed={tasks.filter(isDone)}
      composerDefaults={{ listId }}
      composerKey={listId}
      showList={false}
      empty="No tasks in this list yet."
    />
  )
}

// completedAt is a UTC timestamp; convert to the user's local day before comparing.
function isLocalToday(iso: string) {
  return format(parseISO(iso), 'yyyy-MM-dd') === todayKey()
}
