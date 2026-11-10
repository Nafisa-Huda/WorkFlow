import { addMinutes, differenceInMinutes, format, isToday, setHours, startOfDay } from 'date-fns'
import { Check } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Task } from '@/lib/types'
import { useDetailParams } from '@/lib/useDetailParams'
import { cn } from '@/lib/utils'
import { DraggableAgendaBlock, DropSlot } from './dnd'
import { layoutDay, MINUTES_PER_DAY } from './layout'

const HOUR_HEIGHT = 60 // px: 1px per minute
const PX_PER_MINUTE = HOUR_HEIGHT / 60
const GUTTER = 52 // px, hour labels
const RIGHT_PAD = 8 // px
const SLOT_MINUTES = 30

/** Re-renders every minute, for the "now" line. */
function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  return now
}

/**
 * A day as an hourly timeline: scheduled tasks positioned by time, a "now"
 * line, and (with `droppable`) half-hour slots to drop tasks onto.
 */
export function DayAgenda({
  date,
  tasks,
  droppable = false,
}: {
  date: Date
  tasks: Task[]
  droppable?: boolean
}) {
  const { openTask } = useDetailParams()
  const scrollRef = useRef<HTMLDivElement>(null)
  const now = useNow()
  const dayStart = startOfDay(date)
  const showNow = isToday(date)

  const positioned = useMemo(() => {
    const items = tasks
      .filter((task) => task.scheduledStart && task.scheduledEnd)
      .map((task) => ({
        id: task.id,
        start: new Date(task.scheduledStart!),
        end: new Date(task.scheduledEnd!),
        task,
      }))
    return layoutDay(items, date)
  }, [tasks, date])

  // Start scrolled to something useful: a bit before now on today, 8 AM otherwise.
  const dayKey = dayStart.getTime()
  useEffect(() => {
    const minutes = isToday(dayKey) ? differenceInMinutes(new Date(), dayKey) - 90 : 8 * 60
    if (scrollRef.current) scrollRef.current.scrollTop = Math.max(0, minutes) * PX_PER_MINUTE
  }, [dayKey])

  const column = (index: number, count: number) => ({
    left: `calc(${GUTTER}px + (100% - ${GUTTER + RIGHT_PAD}px) * ${index / count})`,
    width: `calc((100% - ${GUTTER + RIGHT_PAD}px) / ${count} - 2px)`,
  })

  return (
    <div ref={scrollRef} className="relative h-full overflow-y-auto overscroll-contain">
      <div className="relative" style={{ height: MINUTES_PER_DAY * PX_PER_MINUTE }}>
        {/* Hour grid */}
        {Array.from({ length: 24 }, (_, hour) => (
          <div
            key={hour}
            className="absolute inset-x-0 border-t border-border/60"
            style={{ top: hour * HOUR_HEIGHT }}
          >
            {hour > 0 && (
              <span className="absolute -top-2 left-0 w-11 bg-background pr-1 text-right text-[11px] text-muted-foreground tabular-nums">
                {format(setHours(dayStart, hour), 'h a')}
              </span>
            )}
          </div>
        ))}

        {droppable &&
          Array.from({ length: MINUTES_PER_DAY / SLOT_MINUTES }, (_, i) => {
            const start = addMinutes(dayStart, i * SLOT_MINUTES)
            return (
              <DropSlot
                key={i}
                start={start}
                label={format(start, 'h:mm a')}
                style={{
                  top: i * SLOT_MINUTES * PX_PER_MINUTE,
                  height: SLOT_MINUTES * PX_PER_MINUTE,
                  left: GUTTER,
                  right: RIGHT_PAD,
                }}
              />
            )
          })}

        {/* Scheduled tasks */}
        <ul aria-label={`Schedule for ${format(date, 'EEEE, MMMM d')}`}>
          {positioned.map(({ item, top, height, column: col, columns }) => {
            const { task } = item
            const style = {
              top: top * PX_PER_MINUTE,
              height: height * PX_PER_MINUTE - 2,
              ...column(col, columns),
            }
            const time = `${format(item.start, 'h:mm')}–${format(item.end, 'h:mm a')}`
            const compact = height < 40

            const block = (props: {
              ref?: (node: HTMLElement | null) => void
              onPointerDown?: (event: React.PointerEvent) => void
              isDragging?: boolean
            }) => (
              <li key={item.id} ref={props.ref} className="absolute z-10" style={style}>
                <button
                  type="button"
                  onPointerDown={props.onPointerDown}
                  onClick={() => openTask(task.id)}
                  className={cn(
                    'flex size-full flex-col overflow-hidden rounded-md border-l-[3px] border-primary bg-primary/10 px-2 py-0.5 text-left text-xs hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                    droppable && !task.completedAt && 'cursor-grab touch-none',
                    task.completedAt && 'opacity-60',
                    props.isDragging && 'opacity-40',
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center gap-1 truncate font-medium',
                      task.completedAt && 'line-through',
                    )}
                  >
                    {task.completedAt && <Check className="size-3 shrink-0" aria-hidden />}
                    {task.title}
                  </span>
                  {!compact && <span className="truncate text-muted-foreground">{time}</span>}
                  <span className="sr-only">{`${time}${task.completedAt ? ', done' : ''}`}</span>
                </button>
              </li>
            )

            return droppable ? (
              <DraggableAgendaBlock key={item.id} task={task}>
                {block}
              </DraggableAgendaBlock>
            ) : (
              block({})
            )
          })}
        </ul>

        {showNow && (
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 z-30 flex items-center"
            style={{
              top: differenceInMinutes(now, dayStart) * PX_PER_MINUTE,
              left: GUTTER - 4,
            }}
          >
            <span className="size-2 -translate-y-px rounded-full bg-red-500" />
            <span className="h-px flex-1 bg-red-500" />
          </div>
        )}
      </div>
    </div>
  )
}
