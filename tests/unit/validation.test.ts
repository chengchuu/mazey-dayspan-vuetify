import { describe, expect, it } from 'vitest'
import { validateEvent } from '../../src/core/recurrence'
import { createMazeyDaySpanContext } from '../../src/plugin/context'
import type { CalendarEvent, EventValidationError } from '../../src/types'

const event: CalendarEvent = {
  id: '',
  title: 'Invalid event',
  start: new Date(Number.NaN),
  end: new Date(Number.NaN),
}

describe('event validation messages', () => {
  it('returns a typed code for each invalid event field', () => {
    expect(validateEvent(event).errors).toEqual(['idRequired', 'startInvalid', 'endInvalid'])
  })

  it('provides a distinct localized message for every validation code', () => {
    const dayspan = createMazeyDaySpanContext()
    const codes: EventValidationError[] = [
      'idRequired',
      'titleRequired',
      'startInvalid',
      'endInvalid',
      'endAfterStart',
    ]

    expect(new Set(codes.map((code) => dayspan.t(code))).size).toBe(codes.length)
  })
})
