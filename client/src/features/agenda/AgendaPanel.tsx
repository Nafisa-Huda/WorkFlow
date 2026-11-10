import { format } from 'date-fns'
import type { Task } from '@/lib/types'
import { DayAgenda } from './DayAgenda'

/** A day's agenda with a header. */
export function AgendaPanel({
  title,
  date,
  tasks,
  hint,
  droppable,
}: {
  title: string
  date: Date
  tasks: Task[]
  hint?: string
  droppable?: boolean
}) {
  return (
    <section aria-labelledby="agenda-title" className="flex h-full flex-col">
      <header className="border-b px-4 py-3">
        <h2 id="agenda-title" className="text-sm font-semibold">
          {title}
        </h2>
        <p className="text-xs text-muted-foreground">{hint ?? format(date, 'EEEE, MMMM d')}</p>
      </header>
      <div className="min-h-0 flex-1">
        <DayAgenda date={date} tasks={tasks} droppable={droppable} />
      </div>
    </section>
  )
}
