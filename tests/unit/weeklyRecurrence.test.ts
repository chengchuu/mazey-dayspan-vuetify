import { describe, expect, it } from 'vitest'
import { dateKey } from '../../src/core/date'
import { expandEvent } from '../../src/core/recurrence'
import type { CalendarEvent, CalendarRange, Weekday } from '../../src/types'

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

function boundaryEvent(weekStart?: Weekday): CalendarEvent {
  return {
    id: 'week-boundary',
    title: 'Week boundary',
    start: new Date(2026, 6, 5, 9),
    end: new Date(2026, 6, 5, 10),
    schedule: {
      recurrence: {
        frequency: 'weekly',
        interval: 2,
        byWeekday: [0, 1],
        weekStart,
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

  it('defaults weekly interval alignment to Monday', () => {
    const boundaryRange: CalendarRange = {
      start: new Date(2026, 6, 5),
      end: new Date(2026, 7, 1),
    }
    const implicit = expandEvent(boundaryEvent(), boundaryRange)
    const explicit = expandEvent(boundaryEvent(1), boundaryRange)

    expect(implicit.map((item) => dateKey(item.start))).toEqual([
      '2026-07-05',
      '2026-07-13',
      '2026-07-19',
      '2026-07-27',
    ])
    expect(implicit.map((item) => item.start.getTime())).toEqual(explicit.map((item) => item.start.getTime()))
  })

  it('aligns interval buckets to an explicit Sunday week start', () => {
    const boundaryRange: CalendarRange = {
      start: new Date(2026, 6, 5),
      end: new Date(2026, 7, 1),
    }
    const occurrences = expandEvent(boundaryEvent(0), boundaryRange)

    expect(occurrences.map((item) => dateKey(item.start))).toEqual([
      '2026-07-05',
      '2026-07-06',
      '2026-07-19',
      '2026-07-20',
    ])
  })
})
