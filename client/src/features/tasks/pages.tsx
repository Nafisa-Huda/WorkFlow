import { format, parseISO } from 'date-fns'
import { Navigate, useParams } from 'react-router'
import { AgendaPanel } from '@/features/agenda/AgendaPanel'
import { ScheduleDndContext } from '@/features/agenda/dnd'
import { useEvents } from '@/features/events/api'
import { useLists } from '@/features/lists/api'
import { dayRange, formatDayHeading, isInRange, todayKey, tomorrowKey } from '@/lib/dates'
import type { Task } from '@/lib/types'
import { useTasks } from './api'
import { TaskView, type TaskSection } from './TaskView'

const isOpen = (t: Task) => !t.completedAt
const isDone = (t: Task) => !!t.completedAt

export function TodayPage() {
  const today = todayKey()
  const range = dayRange(new Date())
  const due = useTasks({ dueTo: today })
  const scheduled = useTasks({
    scheduledFrom: range.from.toISOString(),
    scheduledTo: range.to.toISOString(),
  })
  const events = useEvents(range)

  // Today = due today (or overdue) + anything scheduled today, whatever its due date.
  const tasks = [
    ...new Map([...(due.data ?? []), ...(scheduled.data ?? [])].map((t) => [t.id, t])).values(),
  ]
  const isScheduledToday = (t: Task) => !!t.scheduledStart && isInRange(t.scheduledStart, range)
  const byScheduleTime = (a: Task, b: Task) =>
    (a.scheduledStart ?? '\uffff').localeCompare(b.scheduledStart ?? '\uffff')

  // Completed tasks stay visible today if they were due/scheduled today or finished today,
  // so checking something off feels rewarding instead of making it vanish.
  const completed = tasks.filter(
    (t) =>
      isDone(t) && (t.dueDate === today || isScheduledToday(t) || isLocalToday(t.completedAt!)),
  )
  const overdue = tasks.filter(
    (t) => isOpen(t) && !!t.dueDate && t.dueDate < today && !isScheduledToday(t),
  )

  return (
    <ScheduleDndContext>
      <TaskView
        title="Today"
        subtitle={format(new Date(), 'EEEE, MMMM d')}
        query={{
          isPending: due.isPending || scheduled.isPending,
          isError: due.isError || scheduled.isError,
          refetch: () => Promise.all([due.refetch(), scheduled.refetch()]),
        }}
        sections={[
          {
            id: 'overdue',
            title: 'Overdue',
            tone: 'danger',
            tasks: overdue,
          },
          {
            id: 'today',
            // Only needs a heading to tell it apart from Overdue.
            title: overdue.length ? 'Today' : undefined,
            tasks: tasks
              .filter((t) => isOpen(t) && (t.dueDate === today || isScheduledToday(t)))
              .sort(byScheduleTime),
            hideDue: true,
          },
        ]}
        completed={completed}
        composerDefaults={{ dueDate: today }}
        draggable
        aside={
          <AgendaPanel
            title="Schedule"
            date={range.from}
            events={events.data ?? []}
            tasks={scheduled.data ?? []}
            hint="Drag a task here, or set a time in its details."
            droppable
          />
        }
        empty="Nothing due today. Add a task above, or plan ahead in Upcoming."
      />
    </ScheduleDndContext>
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
