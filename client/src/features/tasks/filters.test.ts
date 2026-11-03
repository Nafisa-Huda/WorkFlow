import { describe, expect, it } from 'vitest'
import { makeTask } from '@/test/fixtures'
import { matchesFilter } from './filters'

describe('matchesFilter', () => {
  const open = makeTask({ listId: 'work', dueDate: '2026-10-30' })
  const done = makeTask({ completedAt: '2026-10-30T15:00:00.000Z' })
  const undated = makeTask()

  it('matches everything with an empty filter', () => {
    expect([open, done, undated].every((t) => matchesFilter(t, {}))).toBe(true)
  })

  it('filters by list, with "none" meaning the inbox', () => {
    expect(matchesFilter(open, { listId: 'work' })).toBe(true)
    expect(matchesFilter(open, { listId: 'home' })).toBe(false)
    expect(matchesFilter(undated, { listId: 'none' })).toBe(true)
    expect(matchesFilter(open, { listId: 'none' })).toBe(false)
  })

  it('filters by status', () => {
    expect(matchesFilter(open, { status: 'open' })).toBe(true)
    expect(matchesFilter(done, { status: 'open' })).toBe(false)
    expect(matchesFilter(done, { status: 'completed' })).toBe(true)
    expect(matchesFilter(done, { status: 'all' })).toBe(true)
  })

  it('filters by due date range, excluding undated tasks', () => {
    expect(matchesFilter(open, { dueTo: '2026-10-30' })).toBe(true)
    expect(matchesFilter(open, { dueTo: '2026-10-29' })).toBe(false)
    expect(matchesFilter(open, { dueFrom: '2026-10-31' })).toBe(false)
    expect(matchesFilter(undated, { dueTo: '2026-10-30' })).toBe(false)
  })

  it('filters by scheduled time, with an exclusive end', () => {
    const scheduled = makeTask({
      scheduledStart: '2026-10-30T14:00:00.000Z',
      scheduledEnd: '2026-10-30T14:30:00.000Z',
    })
    const range = {
      scheduledFrom: '2026-10-30T04:00:00.000Z',
      scheduledTo: '2026-10-31T04:00:00.000Z',
    }
    expect(matchesFilter(scheduled, range)).toBe(true)
    expect(matchesFilter(undated, range)).toBe(false)
    expect(matchesFilter(scheduled, { scheduledTo: '2026-10-30T14:00:00.000Z' })).toBe(false)
  })
})
