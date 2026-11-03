import { addDays, format, parseISO, startOfMonth } from 'date-fns'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { AgendaPanel } from '@/features/agenda/AgendaPanel'
import { useEvents } from '@/features/events/api'
import { useLists } from '@/features/lists/api'
import { useTasks } from '@/features/tasks/api'
import { TaskItem } from '@/features/tasks/TaskItem'
import { dayRange, isInRange, monthGrid, toDateKey } from '@/lib/dates'
import { useDetailParams } from '@/lib/useDetailParams'
import { MonthGrid, type DayMarkers } from './MonthGrid'

export function CalendarPage() {
  const [params, setParams] = useSearchParams()
  // The selected day lives in the URL (?date=2026-11-03), so it survives reloads and back/forward.
  const dateParam = params.get('date')
  const selected = dateParam ? parseISO(dateParam) : new Date()
  const [month, setMonth] = useState(() => startOfMonth(selected))
  const { openTask } = useDetailParams()
  const { data: lists = [] } = useLists()

  const days = monthGrid(month)
  const gridRange = { from: days[0]!, to: addDays(days.at(-1)!, 1) }
  const events = useEvents(gridRange).data ?? []
  const scheduled =
    useTasks({
      scheduledFrom: gridRange.from.toISOString(),
      scheduledTo: gridRange.to.toISOString(),
    }).data ?? []
  const due =
    useTasks({
      dueFrom: toDateKey(gridRange.from),
      dueTo: toDateKey(days.at(-1)!),
      status: 'open',
    }).data ?? []

  // Dots on the month grid: how many events and tasks fall on each day.
  const markers = new Map<string, DayMarkers>()
  const bump = (key: string, field: keyof DayMarkers) => {
    const entry = markers.get(key) ?? { events: 0, tasks: 0 }
    entry[field]++
    markers.set(key, entry)
  }
  events.forEach((e) => bump(toDateKey(new Date(e.start)), 'events'))
  scheduled.forEach((t) => bump(toDateKey(new Date(t.scheduledStart!)), 'tasks'))
  due.filter((t) => !t.scheduledStart).forEach((t) => bump(t.dueDate!, 'tasks'))

  const day = dayRange(selected)
  const dayKey = toDateKey(selected)
  const dayEvents = events.filter((e) => new Date(e.start) < day.to && new Date(e.end) > day.from)
  const dayTasks = scheduled.filter((t) => isInRange(t.scheduledStart!, day))
  const dueToday = due.filter((t) => t.dueDate === dayKey)

  const selectDay = (date: Date) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('date', toDateKey(date))
        return next
      },
      { replace: true },
    )

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <title>Calendar · WorkFlow</title>
      <div className="mx-auto w-full max-w-xl px-4 py-6 sm:px-8 sm:py-10">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Calendar</h1>
        <MonthGrid
          month={month}
          selected={selected}
          markers={markers}
          onMonthChange={setMonth}
          onSelect={selectDay}
        />
        <section aria-labelledby="due-heading" className="mt-8">
          <h2 id="due-heading" className="mb-1 border-b pb-2 text-sm font-semibold">
            Due {format(selected, 'EEE, MMM d')}
          </h2>
          {dueToday.length ? (
            <ul>
              {dueToday.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  showDue={false}
                  list={lists.find((l) => l.id === task.listId)}
                  onOpen={(t) => openTask(t.id)}
                />
              ))}
            </ul>
          ) : (
            <p className="py-3 text-sm text-muted-foreground">Nothing due this day.</p>
          )}
        </section>
      </div>
      <aside className="h-[36rem] border-t lg:sticky lg:top-0 lg:h-svh lg:border-t-0 lg:border-l">
        <AgendaPanel
          title={format(selected, 'EEEE, MMMM d')}
          hint="Click a time to add an event."
          date={day.from}
          events={dayEvents}
          tasks={dayTasks}
        />
      </aside>
    </div>
  )
}
