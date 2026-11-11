import { addMinutes, differenceInMinutes, endOfDay, startOfDay } from 'date-fns'

export const MINUTES_PER_DAY = 24 * 60
/** Short items still need to be tall enough to read and click. */
const MIN_DURATION = 20

/**
 * Lays out a day's scheduled tasks like a calendar app: each item
 * spans its time range, and items that overlap share the width in columns.
 *
 * Items are grouped into clusters of transitively overlapping items; within a
 * cluster each item takes the first column that's free at its start time, and
 * every item in the cluster is as narrow as the cluster's busiest moment.
 *
 * Returns [{ item, top, height, column, columns }]: top and height are in minutes
 * from midnight (clamped to the day); column/columns place overlapping items side by side.
 */
export function layoutDay(items, day) {
  const dayStart = startOfDay(day)
  const dayEnd = endOfDay(day)

  const visible = items
    .filter((item) => item.end > dayStart && item.start <= dayEnd)
    .map((item) => {
      // Clamp multi-day items to this day.
      const top = Math.max(0, differenceInMinutes(item.start, dayStart))
      const bottom = Math.min(MINUTES_PER_DAY, differenceInMinutes(item.end, dayStart))
      return { item, top, bottom: Math.max(bottom, top + MIN_DURATION) }
    })
    .sort((a, b) => a.top - b.top || b.bottom - a.bottom)

  const result = []
  let cluster = []
  let columnEnds = []
  let clusterEnd = -1

  const flush = () => {
    for (const entry of cluster) {
      result.push({
        item: entry.item,
        top: entry.top,
        height: entry.bottom - entry.top,
        column: entry.column,
        columns: columnEnds.length,
      })
    }
    cluster = []
    columnEnds = []
  }

  for (const entry of visible) {
    if (entry.top >= clusterEnd) flush()
    let column = columnEnds.findIndex((end) => end <= entry.top)
    if (column === -1) column = columnEnds.push(0) - 1
    columnEnds[column] = entry.bottom
    cluster.push({ ...entry, column })
    clusterEnd = Math.max(clusterEnd, entry.bottom)
  }
  flush()

  return result
}

/** The time a drop lands on: slot start, keeping the task's duration if it already had one. */
export function scheduleAt(slotStart, task, defaultMinutes = 30) {
  const duration =
    task.scheduledStart && task.scheduledEnd
      ? differenceInMinutes(new Date(task.scheduledEnd), new Date(task.scheduledStart))
      : defaultMinutes
  return {
    scheduledStart: slotStart.toISOString(),
    scheduledEnd: addMinutes(slotStart, duration).toISOString(),
  }
}
