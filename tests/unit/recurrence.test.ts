import { describe,expect,it } from 'vitest'; import { cancelOccurrence,expandEvent,isValidRecurrenceRule,moveOccurrence,validateEvent } from '../../src/core/recurrence'; import type { CalendarEvent,CalendarRange } from '../../src/types'
const range:CalendarRange={start:new Date('2026-07-01T00:00:00'),end:new Date('2026-07-15T00:00:00')};const event:CalendarEvent={id:'standup',title:'Standup',start:new Date('2026-07-01T09:00:00'),end:new Date('2026-07-01T09:30:00'),schedule:{recurrence:{frequency:'daily',count:5},exclusions:[new Date('2026-07-03T09:00:00')],inclusions:[new Date('2026-07-10T09:00:00')]}}
describe('recurrence',()=>{it('generates rules plus inclusions and exclusions',()=>expect(expandEvent(event,range).map(item=>item.start.getDate())).toEqual([1,2,4,5,10]));it('cancels one occurrence immutably',()=>{const changed=cancelOccurrence(event,new Date('2026-07-02T09:00:00'));expect(expandEvent(changed,range).some(item=>item.start.getDate()===2)).toBe(false);expect(event.schedule?.overrides).toBeUndefined()});it('moves one occurrence while retaining its identity',()=>{const changed=moveOccurrence(event,new Date('2026-07-02T09:00:00'),new Date('2026-07-02T14:00:00'),new Date('2026-07-02T15:00:00'));expect(expandEvent(changed,range)[1]?.start.getHours()).toBe(14)});it('validates meaningful fields and chronological bounds',()=>expect(validateEvent({...event,title:'',end:event.start}).errors).toEqual(['titleRequired','endAfterStart']))})

describe('recurrence range and calendar boundaries', () => {
  it('fast-forwards an old unbounded daily series into the requested range', () => {
    const old = { ...event, start:new Date(2020, 0, 1, 9), end:new Date(2020, 0, 1, 10), schedule:{ recurrence:{ frequency:'daily' as const } } }
    expect(expandEvent(old, range).map((item) => item.start.getDate())).toEqual(Array.from({ length:14 }, (_, index) => index + 1))
  })

  it('filters moved occurrences by their effective range while retaining identity', () => {
    const movedOut = moveOccurrence(event, new Date('2026-07-02T09:00:00'), new Date('2026-07-20T09:00:00'), new Date('2026-07-20T09:30:00'))
    expect(expandEvent(movedOut, range).some((item) => item.start.getDate() === 20)).toBe(false)

    const base = { ...event, start:new Date('2026-06-30T09:00:00'), end:new Date('2026-06-30T09:30:00'), schedule:{ recurrence:{ frequency:'daily' as const, count:1 } } }
    const movedIn = moveOccurrence(base, base.start, new Date('2026-07-02T09:00:00'), new Date('2026-07-02T09:30:00'))
    expect(expandEvent(movedIn, range).map((item) => [item.start.getDate(), item.originalStart.getMonth()])).toEqual([[2, 5]])
  })

  it('clamps month-end and leap-day rules without losing the anchor day', () => {
    const monthly = { ...event, start:new Date(2026, 0, 31, 9), end:new Date(2026, 0, 31, 10), schedule:{ recurrence:{ frequency:'monthly' as const, count:3 } } }
    const yearly = { ...event, start:new Date(2024, 1, 29, 9), end:new Date(2024, 1, 29, 10), schedule:{ recurrence:{ frequency:'yearly' as const, count:2 } } }
    expect(expandEvent(monthly, { start:new Date(2026, 0, 1), end:new Date(2026, 3, 1) }).map((item) => [item.start.getMonth(), item.start.getDate()])).toEqual([[0,31],[1,28],[2,31]])
    expect(expandEvent(yearly, { start:new Date(2024, 0, 1), end:new Date(2026, 0, 1) }).map((item) => [item.start.getFullYear(), item.start.getMonth(), item.start.getDate()])).toEqual([[2024,1,29],[2025,1,28]])
  })

  it('supports monthly dates and yearly month selectors', () => {
    const monthly = { ...event, start:new Date(2026, 0, 10, 9), end:new Date(2026, 0, 10, 10), schedule:{ recurrence:{ frequency:'monthly' as const, byMonthDay:[15], count:3 } } }
    const yearly = { ...event, start:new Date(2026, 0, 10, 9), end:new Date(2026, 0, 10, 10), schedule:{ recurrence:{ frequency:'yearly' as const, byMonth:[2], byMonthDay:[1], count:2 } } }
    expect(expandEvent(monthly, { start:new Date(2026, 0, 1), end:new Date(2026, 4, 1) }).map((item) => [item.start.getMonth(), item.start.getDate()])).toEqual([[0,15],[1,15],[2,15]])
    expect(expandEvent(yearly, { start:new Date(2026, 0, 1), end:new Date(2028, 0, 1) }).map((item) => [item.start.getFullYear(), item.start.getMonth(), item.start.getDate()])).toEqual([[2026,1,1],[2027,1,1]])
  })

  it('does not spend the occurrence limit scanning days for counted yearly selectors', () => {
    const yearly = { ...event, start:new Date(2026, 0, 10, 9), end:new Date(2026, 0, 10, 10), schedule:{ recurrence:{ frequency:'yearly' as const, byMonth:[2], byMonthDay:[1], count:10 } } }
    expect(expandEvent(yearly, { start:new Date(2030, 0, 1), end:new Date(2031, 0, 1) }).map((item) => [item.start.getMonth(), item.start.getDate()])).toEqual([[1,1]])
  })

  it('rejects malformed runtime rule shapes without throwing', () => {
    expect(isValidRecurrenceRule({ frequency:'hourly' })).toBe(false)
    expect(isValidRecurrenceRule({ frequency:'weekly', byWeekday:'Monday' })).toBe(false)
    expect(isValidRecurrenceRule({ frequency:'weekly', byWeekday:[undefined] })).toBe(false)
  })

  it('terminates selector generation when every requested date is impossible', () => {
    const impossible = { ...event, start:new Date(2026, 1, 1, 9), end:new Date(2026, 1, 1, 10), schedule:{ recurrence:{ frequency:'yearly' as const, byMonth:[2], byMonthDay:[30] } } }
    expect(expandEvent(impossible, { start:new Date(2026, 0, 1), end:new Date(2030, 0, 1) })).toEqual([])
  })

  it('only backfills overrides whose identity belongs to the bounded rule', () => {
    const base = { ...event, start:new Date(2026, 6, 1, 9), end:new Date(2026, 6, 1, 10), schedule:{ recurrence:{ frequency:'daily' as const, count:3 } } }
    const invalid = moveOccurrence(base, new Date(2026, 6, 10, 9), new Date(2026, 6, 1, 14), new Date(2026, 6, 1, 15))
    expect(expandEvent(invalid, { start:new Date(2026, 6, 1), end:new Date(2026, 6, 2) })).toHaveLength(1)

    const valid = moveOccurrence(base, new Date(2026, 6, 3, 9), new Date(2026, 6, 1, 14), new Date(2026, 6, 1, 15))
    expect(expandEvent(valid, { start:new Date(2026, 6, 1), end:new Date(2026, 6, 2) }).map((item) => item.originalStart.getDate())).toEqual([1,3])
  })

  it('backfills far-away overrides for unbounded rules', () => {
    const base = { ...event, start:new Date(2020, 0, 1, 9), end:new Date(2020, 0, 1, 10), schedule:{ recurrence:{ frequency:'daily' as const } } }
    const moved = moveOccurrence(base, new Date(2026, 6, 10, 9), new Date(2026, 6, 1, 14), new Date(2026, 6, 1, 15))
    const occurrences = expandEvent(moved, { start:new Date(2026, 6, 1), end:new Date(2026, 6, 2) })

    expect(occurrences.some((item) => item.originalStart.getDate() === 10 && item.start.getHours() === 14)).toBe(true)
  })

  it('fails safely for invalid runtime recurrence values', () => {
    const invalid = { ...event, schedule:{ recurrence:{ frequency:'daily' as const, interval:Number.NaN } } }
    expect(expandEvent(invalid, range)).toEqual([])
  })
})
