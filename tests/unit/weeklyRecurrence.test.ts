import { describe, expect, it } from 'vitest'
import { dateKey } from '../../src/core/date'
import { expandEvent } from '../../src/core/recurrence'
import type { CalendarEvent, CalendarRange } from '../../src/types'

const range: CalendarRange = {
  start: new Date(2026, 6, 1),
  end: new Date(2026, 7, 1),
}

function eventWithCount(count?: number): CalendarEvent {
  return {
    id: 'fortnightly',
    title: 'Fortnightly sync',
    start: new Date(2026, 6, 1, 9),
    end: new Date(2026, 6, 1, 10),
    schedule: {
      recurrence: {
        frequency: 'weekly',
        interval: 2,
        byWeekday: [1, 3],
        count,
      },
    },
  }
}

describe('weekly recurrence intervals', () => {
  it('only emits selected weekdays in each active interval week', () => {
    const occurrences = expandEvent(eventWithCount(), range)

    expect(occurrences.map((item) => dateKey(item.start))).toEqual([
      '2026-07-01',
      '2026-07-13',
      '2026-07-15',
      '2026-07-27',
      '2026-07-29',
    ])
  })

  it('applies count to matching occurrences rather than scanned days', () => {
    const occurrences = expandEvent(eventWithCount(3), range)

    expect(occurrences.map((item) => dateKey(item.start))).toEqual([
      '2026-07-01',
      '2026-07-13',
      '2026-07-15',
    ])
  })
})
