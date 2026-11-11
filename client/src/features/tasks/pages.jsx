import { format, parseISO } from 'date-fns'
import { Navigate, useParams } from 'react-router'
import { AgendaPanel } from '@/features/agenda/AgendaPanel'
import { ScheduleDndContext } from '@/features/agenda/dnd'
import { useLists } from '@/features/lists/api'
import { dayRange, formatDayHeading, todayKey, tomorrowKey } from '@/lib/dates'
import { useTasks } from './api'
import { TaskView } from './TaskView'

const isOpen = (t) => !t.completedAt
const isDone = (t) => !!t.completedAt

export function TodayPage() {
  const today = todayKey()
  const range = dayRange(new Date())
  // The list shows what's due (today or overdue); the agenda shows what's scheduled for today.
  const due = useTasks({ dueTo: today })
  const scheduled = useTasks({
    scheduledFrom: range.from.toISOString(),
    scheduledTo: range.to.toISOString(),
  })
  const tasks = due.data ?? []

  // Finished tasks stay in view for the rest of the day, so checking one off doesn't make it vanish.
  const completed = tasks.filter(
    (t) => isDone(t) && (t.dueDate === today || isLocalToday(t.completedAt)),
  )

  return (
    <ScheduleDndContext>
      <TaskView
        title="Today"
        subtitle={format(new Date(), 'EEEE, MMMM d')}
        query={due}
        sections={[
          {
            id: 'overdue',
            title: 'Overdue',
            danger: true,
            tasks: tasks.filter((t) => isOpen(t) && t.dueDate < today),
          },
          {
            id: 'today',
            title: 'Today',
            tasks: tasks.filter((t) => isOpen(t) && t.dueDate === today),
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
  const byDay = Map.groupBy(query.data ?? [], (t) => t.dueDate)
  const sections = [...byDay.keys()].sort().map((day) => ({
    id: day,
    title: formatDayHeading(day),
    tasks: byDay.get(day),
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
      key={listId} // a fresh view (and empty quick-add box) when switching lists
      title={list?.name ?? ''}
      query={query}
      sections={[{ id: 'open', tasks: tasks.filter(isOpen) }]}
      completed={tasks.filter(isDone)}
      composerDefaults={{ listId }}
      showList={false}
      empty="No tasks in this list yet."
    />
  )
}

// completedAt is a UTC timestamp; convert to the user's local day before comparing.
function isLocalToday(iso) {
  return format(parseISO(iso), 'yyyy-MM-dd') === todayKey()
}
