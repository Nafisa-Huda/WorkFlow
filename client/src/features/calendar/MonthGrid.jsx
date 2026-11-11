import { addMonths, format, isSameDay, isSameMonth, isToday, startOfMonth } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { monthGrid, toDateKey } from '@/lib/dates'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Month calendar. `taskCounts` maps "YYYY-MM-DD" to the number of tasks that day;
 * days with tasks get a dot.
 */
export function MonthGrid({ month, selected, taskCounts, onMonthChange, onSelect }) {
  const days = monthGrid(month)

  const select = (day) => {
    // Clicking a greyed-out day from the next/previous month moves to that month.
    if (!isSameMonth(day, month)) onMonthChange(startOfMonth(day))
    onSelect(day)
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">{format(month, 'MMMM yyyy')}</h2>
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
          <Button variant="outline" size="sm" onClick={() => select(new Date())}>
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

      <div className="grid grid-cols-7">
        {WEEKDAYS.map((day) => (
          <div key={day} className="pb-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const count = taskCounts.get(toDateKey(day)) ?? 0
          const isSelected = isSameDay(day, selected)
          return (
            <div key={day.toISOString()} className="p-0.5">
              <button
                type="button"
                onClick={() => select(day)}
                aria-label={format(day, 'EEEE, MMMM d')}
                aria-pressed={isSelected}
                className={cn(
                  'flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg text-sm transition-colors hover:bg-muted',
                  !isSameMonth(day, month) && 'text-muted-foreground/50',
                  isToday(day) && 'font-semibold text-primary',
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
                )}
              >
                {format(day, 'd')}
                <span className="flex h-1.5">
                  {count > 0 && (
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
    </div>
  )
}
