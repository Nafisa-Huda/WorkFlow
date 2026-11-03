import { addDays, addMonths, format, isSameDay, isSameMonth, isToday, startOfMonth } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { monthGrid, toDateKey } from '@/lib/dates'
import { cn } from '@/lib/utils'

export interface DayMarkers {
  events: number
  tasks: number
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const KEY_STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
}

/**
 * Month calendar. One day is tabbable at a time (roving tabindex), and arrow
 * keys move between days, crossing into the next/previous month as needed.
 */
export function MonthGrid({
  month,
  selected,
  markers,
  onMonthChange,
  onSelect,
}: {
  month: Date
  selected: Date
  markers: Map<string, DayMarkers>
  onMonthChange: (month: Date) => void
  onSelect: (day: Date) => void
}) {
  const days = monthGrid(month)
  const buttons = useRef(new Map<string, HTMLButtonElement>())
  const moveFocus = useRef(false)

  // After keyboard navigation, move focus to the newly selected day.
  useEffect(() => {
    if (!moveFocus.current) return
    moveFocus.current = false
    buttons.current.get(toDateKey(selected))?.focus()
  }, [selected, month])

  const select = (day: Date) => {
    if (!isSameMonth(day, month)) onMonthChange(startOfMonth(day))
    onSelect(day)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const step = KEY_STEPS[e.key]
    if (!step) return
    e.preventDefault()
    moveFocus.current = true
    select(addDays(selected, step))
  }

  // The selected day is tabbable if it's in view; otherwise the 1st of the month.
  const tabbable = isSameMonth(selected, month) ? selected : startOfMonth(month)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold" aria-live="polite">
          {format(month, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onMonthChange(addMonths(month, -1))}
            aria-label="Previous month"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onMonthChange(startOfMonth(new Date()))
              onSelect(new Date())
            }}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onMonthChange(addMonths(month, 1))}
            aria-label="Next month"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div role="grid" aria-label={format(month, 'MMMM yyyy')} onKeyDown={onKeyDown}>
        <div role="row" className="grid grid-cols-7">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              role="columnheader"
              className="pb-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        {Array.from({ length: days.length / 7 }, (_, week) => (
          <div key={week} role="row" className="grid grid-cols-7">
            {days.slice(week * 7, week * 7 + 7).map((day) => {
              const key = toDateKey(day)
              const marker = markers.get(key)
              const isSelected = isSameDay(day, selected)
              const label = [
                format(day, 'EEEE, MMMM d'),
                marker?.events && `${marker.events} event${marker.events > 1 ? 's' : ''}`,
                marker?.tasks && `${marker.tasks} task${marker.tasks > 1 ? 's' : ''}`,
              ]
                .filter(Boolean)
                .join(', ')

              return (
                <div key={key} role="gridcell" aria-selected={isSelected} className="p-0.5">
                  <button
                    type="button"
                    ref={(node) => {
                      if (node) buttons.current.set(key, node)
                      else buttons.current.delete(key)
                    }}
                    tabIndex={isSameDay(day, tabbable) ? 0 : -1}
                    onClick={() => select(day)}
                    aria-label={label}
                    aria-current={isToday(day) ? 'date' : undefined}
                    className={cn(
                      'flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg text-sm transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
                      !isSameMonth(day, month) && 'text-muted-foreground/50',
                      isToday(day) && 'font-semibold text-primary',
                      isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
                    )}
                  >
                    {format(day, 'd')}
                    <span className="flex h-1.5 gap-0.5" aria-hidden>
                      {!!marker?.events && (
                        <span
                          className={cn(
                            'size-1.5 rounded-full bg-sky-500',
                            isSelected && 'bg-primary-foreground',
                          )}
                        />
                      )}
                      {!!marker?.tasks && (
                        <span
                          className={cn(
                            'size-1.5 rounded-full bg-primary',
                            isSelected && 'bg-primary-foreground/70',
                          )}
                        />
                      )}
                    </span>
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
