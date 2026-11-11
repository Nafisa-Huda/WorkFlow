import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameYear,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

/** Formats a date as a calendar day in the user's local timezone, e.g. "2026-10-30". */
export const toDateKey = (date) => format(date, 'yyyy-MM-dd')
export const todayKey = () => toDateKey(new Date())
export const tomorrowKey = () => toDateKey(addDays(new Date(), 1))

// "YYYY-MM-DD" strings compare chronologically.
export const isOverdue = (key) => key < todayKey()

/** Human label for a due date: "Today", "Tomorrow", "Friday", "Nov 14", "Jan 3, 2027". */
export function formatDueLabel(key) {
  const date = parseISO(key) // parsed as local midnight
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isYesterday(date)) return 'Yesterday'
  const daysAway = differenceInCalendarDays(date, new Date())
  if (daysAway > 1 && daysAway < 7) return format(date, 'EEEE')
  return format(date, isSameYear(date, new Date()) ? 'MMM d' : 'MMM d, yyyy')
}

/** Section heading for a day in a list, e.g. "Tomorrow · Sat, Oct 31". */
export function formatDayHeading(key) {
  const date = parseISO(key)
  const full = format(date, 'EEE, MMM d')
  if (isToday(date)) return `Today · ${full}`
  if (isTomorrow(date)) return `Tomorrow · ${full}`
  return full
}

/** [start of day, start of next day) in local time, for range queries. */
export function dayRange(date) {
  const from = startOfDay(date)
  return { from, to: addDays(from, 1) }
}

/** Half-open check: from <= instant < to. */
export function isInRange(iso, { from, to }) {
  const time = Date.parse(iso)
  return time >= from.getTime() && time < to.getTime()
}

/** Every day shown on a month calendar: whole weeks, Sunday first. */
export function monthGrid(month) {
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  })
}
