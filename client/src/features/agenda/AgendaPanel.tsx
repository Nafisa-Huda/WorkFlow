import { addHours, format, isToday, setHours, startOfHour } from 'date-fns'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CalendarEvent, Task } from '@/lib/types'
import { useDetailParams } from '@/lib/useDetailParams'
import { DayAgenda } from './DayAgenda'

/** A day's agenda with a header and a keyboard-reachable "New event" button. */
export function AgendaPanel({
  title,
  date,
  events,
  tasks,
  hint,
  droppable,
}: {
  title: string
  date: Date
  events: CalendarEvent[]
  tasks: Task[]
  hint?: string
  droppable?: boolean
}) {
  const { newEvent } = useDetailParams()
  // Default new events to the next hour today, or 9 AM on other days.
  const suggestedStart = isToday(date) ? startOfHour(addHours(new Date(), 1)) : setHours(date, 9)

  return (
    <section aria-labelledby="agenda-title" className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div>
          <h2 id="agenda-title" className="text-sm font-semibold">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground">{hint ?? format(date, 'EEEE, MMMM d')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => newEvent(suggestedStart)}>
          <Plus />
          New event
        </Button>
      </header>
      <div className="min-h-0 flex-1">
        <DayAgenda date={date} events={events} tasks={tasks} droppable={droppable} />
      </div>
    </section>
  )
}
