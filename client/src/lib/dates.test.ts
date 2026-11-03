import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatDayHeading, formatDueLabel, isOverdue, todayKey, tomorrowKey } from './dates'

describe('dates', () => {
  beforeEach(() => {
    // Friday, Oct 30 2026, 11pm local: late enough that UTC is already "tomorrow"
    // in US timezones, which is exactly the case these helpers must get right.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 30, 23, 0))
  })
  afterEach(() => vi.useRealTimers())

  it('uses the local calendar day, not UTC', () => {
    expect(todayKey()).toBe('2026-10-30')
    expect(tomorrowKey()).toBe('2026-10-31')
  })

  it('labels due dates relative to today', () => {
    expect(formatDueLabel('2026-10-30')).toBe('Today')
    expect(formatDueLabel('2026-10-31')).toBe('Tomorrow')
    expect(formatDueLabel('2026-10-29')).toBe('Yesterday')
    expect(formatDueLabel('2026-11-03')).toBe('Tuesday')
    expect(formatDueLabel('2026-12-25')).toBe('Dec 25')
    expect(formatDueLabel('2027-01-03')).toBe('Jan 3, 2027')
  })

  it('formats day headings', () => {
    expect(formatDayHeading('2026-10-31')).toBe('Tomorrow · Sat, Oct 31')
    expect(formatDayHeading('2026-11-03')).toBe('Tue, Nov 3')
  })

  it('treats only days before today as overdue', () => {
    expect(isOverdue('2026-10-29')).toBe(true)
    expect(isOverdue('2026-10-30')).toBe(false)
  })
})
