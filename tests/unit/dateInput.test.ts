import { describe, expect, it } from 'vitest'
import { fromLocalInput, toLocalInput } from '../../src/utils/dateInput'

describe('date input utilities', () => {
  it('parses datetime-local components in local time', () => {
    const date = fromLocalInput('2026-07-10T14:35')

    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(6)
    expect(date.getDate()).toBe(10)
    expect(date.getHours()).toBe(14)
    expect(date.getMinutes()).toBe(35)
  })

  it('round-trips a local date without changing its wall-clock time', () => {
    const original = new Date(2026, 6, 10, 14, 35)

    expect(fromLocalInput(toLocalInput(original)).getTime()).toBe(original.getTime())
  })

  it.each(['2026-02-30T10:00', '2026-13-01T10:00', '2026-01-01T24:00', 'not-a-date'])(
    'returns an invalid date for invalid input %s',
    (value) => expect(fromLocalInput(value).getTime()).toBeNaN(),
  )
})
