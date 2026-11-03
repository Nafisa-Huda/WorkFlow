import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameYear,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
} from 'date-fns'

/** A calendar day in the user's local timezone, e.g. "2026-10-30". */
export type DateKey = string

export const toDateKey = (date: Date): DateKey => format(date, 'yyyy-MM-dd')
export const todayKey = (): DateKey => toDateKey(new Date())
export const tomorrowKey = (): DateKey => toDateKey(addDays(new Date(), 1))

// "YYYY-MM-DD" strings compare chronologically.
export const isOverdue = (key: DateKey) => key < todayKey()

/** Human label for a due date: "Today", "Tomorrow", "Friday", "Nov 14", "Jan 3, 2027". */
export function formatDueLabel(key: DateKey): string {
  const date = parseISO(key) // parsed as local midnight
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isYesterday(date)) return 'Yesterday'
  const daysAway = differenceInCalendarDays(date, new Date())
  if (daysAway > 1 && daysAway < 7) return format(date, 'EEEE')
  return format(date, isSameYear(date, new Date()) ? 'MMM d' : 'MMM d, yyyy')
}

/** Section heading for a day in a list, e.g. "Tomorrow · Sat, Oct 31". */
export function formatDayHeading(key: DateKey): string {
  const date = parseISO(key)
  const full = format(date, 'EEE, MMM d')
  if (isToday(date)) return `Today · ${full}`
  if (isTomorrow(date)) return `Tomorrow · ${full}`
  return full
}
