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

  it('requires Date instances even when Mazey accepts another date representation', () => {
    const runtimeEvent = {
      id: 'runtime-event',
      title: 'Runtime event',
      start: '2026-08-25 09:00:00',
      end: new Date(2026, 7, 25, 10),
    } as unknown as CalendarEvent

    expect(validateEvent(runtimeEvent).errors).toEqual(['startInvalid'])
  })

  it('accepts valid Date instances and preserves chronological validation', () => {
    const validEvent: CalendarEvent = {
      id: 'valid-event',
      title: 'Valid event',
      start: new Date(2026, 7, 25, 9),
      end: new Date(2026, 7, 25, 10),
    }

    expect(validateEvent(validEvent)).toEqual({ valid:true, errors:[] })
    expect(validateEvent({ ...validEvent, end:validEvent.start }).errors).toEqual(['endAfterStart'])
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
