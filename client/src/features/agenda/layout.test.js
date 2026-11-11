import { describe, expect, it } from 'vitest'
import { layoutDay, scheduleAt } from './layout'

const day = new Date(2026, 10, 3)
const at = (hours, minutes = 0) => new Date(2026, 10, 3, hours, minutes)
const item = (id, start, end) => ({ id, start, end })

const summary = (items) =>
  Object.fromEntries(
    items.map((p) => [
      p.item.id,
      { top: p.top, height: p.height, column: p.column, columns: p.columns },
    ]),
  )

describe('layoutDay', () => {
  it('positions items by minutes from midnight', () => {
    expect(summary(layoutDay([item('a', at(9), at(10, 30))], day))).toEqual({
      a: { top: 540, height: 90, column: 0, columns: 1 },
    })
  })

  it('puts overlapping items side by side', () => {
    const result = summary(
      layoutDay(
        [item('a', at(9), at(11)), item('b', at(10), at(12)), item('c', at(14), at(15))],
        day,
      ),
    )
    expect(result.a).toMatchObject({ column: 0, columns: 2 })
    expect(result.b).toMatchObject({ column: 1, columns: 2 })
    expect(result.c).toMatchObject({ column: 0, columns: 1 }) // separate cluster, full width
  })

  it('reuses a column once it frees up within a cluster', () => {
    const result = summary(
      layoutDay(
        [item('long', at(9), at(12)), item('first', at(9), at(10)), item('second', at(10), at(11))],
        day,
      ),
    )
    expect(result.long.column).toBe(0)
    expect(result.first.column).toBe(1)
    expect(result.second.column).toBe(1)
    expect(result.second.columns).toBe(2)
  })

  it('clamps items that cross midnight and skips other days', () => {
    const result = summary(
      layoutDay(
        [
          item('overnight', new Date(2026, 10, 2, 22), at(1)),
          item('tomorrow', new Date(2026, 10, 4, 9), new Date(2026, 10, 4, 10)),
        ],
        day,
      ),
    )
    expect(result.overnight).toMatchObject({ top: 0, height: 60 })
    expect(result.tomorrow).toBeUndefined()
  })

  it('gives very short items a readable minimum height', () => {
    expect(layoutDay([item('a', at(9), at(9, 5))], day)[0].height).toBe(20)
  })
})

describe('scheduleAt', () => {
  it('defaults to 30 minutes for an unscheduled task', () => {
    const { scheduledStart, scheduledEnd } = scheduleAt(at(14), {
      scheduledStart: null,
      scheduledEnd: null,
    })
    expect(new Date(scheduledStart)).toEqual(at(14))
    expect(new Date(scheduledEnd)).toEqual(at(14, 30))
  })

  it('keeps the existing duration when rescheduling', () => {
    const { scheduledEnd } = scheduleAt(at(15), {
      scheduledStart: at(9).toISOString(),
      scheduledEnd: at(10, 30).toISOString(),
    })
    expect(new Date(scheduledEnd)).toEqual(at(16, 30))
  })
})
