import type { CalendarEvent, CalendarOccurrence, CalendarRange, EventValidationError, OccurrenceOverride, RecurrenceRule } from '../types'
import { addDays, DAY_MS, startOfDay, startOfWeek } from './date'

const sameInstant = (a: Date, b: Date) => a.getTime() === b.getTime()
const matchesList = (value: number, list?: number[]) => !list?.length || list.includes(value)
function advance(date: Date, rule: RecurrenceRule, anchorDay = date.getDate()) {
  const interval = rule.interval ?? 1
  if (rule.frequency === 'daily' || rule.frequency === 'weekly') return addDays(date, interval * (rule.frequency === 'weekly' ? 7 : 1))
  const targetMonth = rule.frequency === 'monthly'
    ? date.getMonth() + interval
    : date.getMonth() + interval * 12
  const lastDay = new Date(date.getFullYear(), targetMonth + 1, 0).getDate()
  return new Date(
    date.getFullYear(), targetMonth, Math.min(anchorDay, lastDay),
    date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds(),
  )
}
function calendarDayIndex(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS
}
function matchesWeeklyInterval(date: Date, recurrenceStart: Date, rule: RecurrenceRule) {
  if (rule.frequency !== 'weekly') return true
  const interval = Math.max(1, rule.interval ?? 1)
  const configuredWeekStart = rule.weekStart ?? 1
  const weekStart = Number.isInteger(configuredWeekStart) && configuredWeekStart >= 0 && configuredWeekStart <= 6
    ? configuredWeekStart
    : 1
  const anchorWeek = startOfWeek(recurrenceStart, weekStart)
  const candidateWeek = startOfWeek(date, weekStart)
  const elapsedWeeks = Math.floor((calendarDayIndex(candidateWeek) - calendarDayIndex(anchorWeek)) / 7)
  return elapsedWeeks >= 0 && elapsedWeeks % interval === 0
}
function matchesPeriodInterval(date: Date, recurrenceStart: Date, rule: RecurrenceRule) {
  const interval = rule.interval ?? 1
  if (rule.frequency === 'monthly') {
    const months = (date.getFullYear() - recurrenceStart.getFullYear()) * 12 + date.getMonth() - recurrenceStart.getMonth()
    return months >= 0 && months % interval === 0
  }
  if (rule.frequency === 'yearly') {
    const years = date.getFullYear() - recurrenceStart.getFullYear()
    return years >= 0 && years % interval === 0
  }
  return true
}
function ruleMatches(date: Date, recurrenceStart: Date, rule: RecurrenceRule) {
  return matchesWeeklyInterval(date, recurrenceStart, rule)
    && matchesPeriodInterval(date, recurrenceStart, rule)
    && matchesList(date.getDay(), rule.byWeekday)
    && matchesList(date.getDate(), rule.byMonthDay)
    && matchesList(date.getMonth() + 1, rule.byMonth)
}
function overrideFor(date: Date, overrides: OccurrenceOverride[] = []) { return overrides.find((item) => sameInstant(item.originalStart, date)) }
function occurrence(event: CalendarEvent, start: Date, originalStart = start): CalendarOccurrence {
  const duration = event.end.getTime() - event.start.getTime()
  const override = overrideFor(originalStart, event.schedule?.overrides)
  const actualStart = override?.start ?? start
  return { ...event, id: `${event.id}@${originalStart.toISOString()}`, sourceEventId: event.id, originalStart, start: actualStart, end: override?.end ?? new Date(actualStart.getTime() + duration) }
}
function intersectsRange(item: CalendarOccurrence, range: CalendarRange) {
  return item.end > range.start && item.start < range.end
}
function validInteger(value: unknown, minimum: number, maximum = Number.MAX_SAFE_INTEGER) {
  return value === undefined || (typeof value === 'number' && Number.isInteger(value) && value >= minimum && value <= maximum)
}
export function isValidRecurrenceRule(rule: unknown): rule is RecurrenceRule {
  if (!rule || typeof rule !== 'object') return false
  const value = rule as Partial<Record<keyof RecurrenceRule, unknown>>
  if (!['daily', 'weekly', 'monthly', 'yearly'].includes(value.frequency as string)) return false
  const validList = (list: unknown, minimum: number, maximum: number) => list === undefined
    || (Array.isArray(list) && list.every((item) => typeof item === 'number' && Number.isInteger(item) && item >= minimum && item <= maximum))
  return validInteger(value.interval, 1)
    && validInteger(value.count, 1)
    && validInteger(value.weekStart, 0, 6)
    && (value.until === undefined || (value.until instanceof Date && !Number.isNaN(value.until.getTime())))
    && validList(value.byWeekday, 0, 6)
    && validList(value.byMonthDay, 1, 31)
    && validList(value.byMonth, 1, 12)
}
function recurrenceThreshold(event: CalendarEvent, range: CalendarRange) {
  const duration = Math.max(0, event.end.getTime() - event.start.getTime())
  return new Date(range.start.getTime() - duration)
}
function withEventTime(date: Date, event: CalendarEvent) {
  date.setHours(event.start.getHours(), event.start.getMinutes(), event.start.getSeconds(), event.start.getMilliseconds())
  return date
}
function uniqueSorted(values: number[]) {
  return [...new Set(values)].sort((a, b) => a - b)
}
function validDateInMonth(event: CalendarEvent, year: number, month: number, day: number) {
  const date = new Date(year, month, day, event.start.getHours(), event.start.getMinutes(), event.start.getSeconds(), event.start.getMilliseconds())
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date : undefined
}
function periodOffset(event: CalendarEvent, range: CalendarRange, rule: RecurrenceRule) {
  if (rule.count) return 0
  const threshold = recurrenceThreshold(event, range)
  const interval = rule.interval ?? 1
  if (rule.frequency === 'weekly') {
    const weeks = Math.floor((calendarDayIndex(startOfWeek(threshold, rule.weekStart ?? 1)) - calendarDayIndex(startOfWeek(event.start, rule.weekStart ?? 1))) / 7)
    return Math.max(0, Math.floor(weeks / interval))
  }
  if (rule.frequency === 'monthly') {
    const months = (threshold.getFullYear() - event.start.getFullYear()) * 12 + threshold.getMonth() - event.start.getMonth()
    return Math.max(0, Math.floor(months / interval))
  }
  if (rule.frequency === 'yearly') {
    return Math.max(0, Math.floor((threshold.getFullYear() - event.start.getFullYear()) / interval))
  }
  return 0
}
function* generatedStarts(event: CalendarEvent, range: CalendarRange, rule: RecurrenceRule): Generator<Date> {
  const interval = rule.interval ?? 1
  if (rule.frequency === 'daily') {
    let cursor = new Date(event.start)
    if (!rule.count) {
      const days = calendarDayIndex(recurrenceThreshold(event, range)) - calendarDayIndex(cursor)
      cursor = addDays(cursor, Math.max(0, Math.floor(days / interval) * interval))
    }
    while (cursor < range.end) {
      if (ruleMatches(cursor, event.start, rule)) yield cursor
      cursor = addDays(cursor, interval)
    }
    return
  }

  let period = periodOffset(event, range, rule)
  while (true) {
    const candidates: Date[] = []
    let periodStart: Date
    if (rule.frequency === 'weekly') {
      const weekStart = rule.weekStart ?? 1
      const first = addDays(startOfWeek(event.start, weekStart), period * interval * 7)
      periodStart = first
      const weekdays = uniqueSorted(rule.byWeekday?.length ? rule.byWeekday : [event.start.getDay()])
      for (const weekday of weekdays) candidates.push(withEventTime(addDays(first, (weekday - weekStart + 7) % 7), event))
    } else if (rule.frequency === 'monthly') {
      const monthIndex = event.start.getMonth() + period * interval
      const year = event.start.getFullYear() + Math.floor(monthIndex / 12)
      const month = ((monthIndex % 12) + 12) % 12
      periodStart = withEventTime(new Date(year, month, 1), event)
      if (rule.byMonthDay?.length) {
        for (const day of uniqueSorted(rule.byMonthDay)) {
          const candidate = validDateInMonth(event, year, month, day)
          if (candidate) candidates.push(candidate)
        }
      } else {
        candidates.push(advance(new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate(), event.start.getHours(), event.start.getMinutes(), event.start.getSeconds(), event.start.getMilliseconds()), { ...rule, interval:period * interval }, event.start.getDate()))
      }
    } else {
      const year = event.start.getFullYear() + period * interval
      periodStart = withEventTime(new Date(year, 0, 1), event)
      const months = rule.byMonth?.length
        ? uniqueSorted(rule.byMonth).map((month) => month - 1)
        : rule.byMonthDay?.length ? Array.from({ length:12 }, (_, month) => month) : [event.start.getMonth()]
      const days = rule.byMonthDay?.length ? uniqueSorted(rule.byMonthDay) : [event.start.getDate()]
      for (const month of months) for (const day of days) {
        const lastDay = new Date(year, month + 1, 0).getDate()
        const candidate = validDateInMonth(event, year, month, rule.byMonthDay?.length ? day : Math.min(day, lastDay))
        if (candidate) candidates.push(candidate)
      }
    }
    if (periodStart >= range.end) return
    candidates.sort((a, b) => a.getTime() - b.getTime())
    for (const candidate of candidates) {
      if (candidate >= event.start && candidate < range.end && ruleMatches(candidate, event.start, rule)) yield candidate
    }
    period++
  }
}
function isRuleOccurrence(event: CalendarEvent, originalStart: Date, rule: RecurrenceRule, limit: number) {
  const end = new Date(originalStart.getTime() + 1)
  let produced = 0
  for (const candidate of generatedStarts(event, { start:event.start, end }, rule)) {
    produced++
    if (rule.until && candidate > rule.until) return false
    if (rule.count && produced > rule.count) return false
    if (sameInstant(candidate, originalStart)) return true
    if (candidate > originalStart || produced >= limit) return false
  }
  return false
}
export function expandEvent(event: CalendarEvent, range: CalendarRange, limit = 1000): CalendarOccurrence[] {
  const schedule = event.schedule
  if (!schedule?.recurrence) return event.end > range.start && event.start < range.end ? [occurrence(event, event.start)] : []
  const rule = schedule.recurrence
  if (!isValidRecurrenceRule(rule) || !Number.isInteger(limit) || limit < 1) return []
  const excluded = new Set((schedule.exclusions ?? []).map((date) => date.toISOString()))
  const cancelled = new Set((schedule.overrides ?? []).filter((item) => item.cancelled).map((item) => item.originalStart.toISOString()))
  const results: CalendarOccurrence[] = []
  let produced = 0
  for (const cursor of generatedStarts(event, range, rule)) {
    if (produced >= limit) break
    if (rule.until && cursor > rule.until) break
    produced++
    const key = cursor.toISOString()
    const item = occurrence(event, cursor)
    if (!excluded.has(key) && !cancelled.has(key) && intersectsRange(item, range)) results.push(item)
    if (rule.count && produced >= rule.count) break
  }
  for (const included of schedule.inclusions ?? []) {
    const key = included.toISOString()
    const item = occurrence(event, included)
    if (!excluded.has(key) && !cancelled.has(key) && intersectsRange(item, range) && !results.some((result) => sameInstant(result.originalStart, included))) results.push(item)
  }
  for (const override of schedule.overrides ?? []) {
    if (override.cancelled || excluded.has(override.originalStart.toISOString()) || results.some((item) => sameInstant(item.originalStart, override.originalStart))) continue
    if (!isRuleOccurrence(event, override.originalStart, rule, limit)) continue
    const item = occurrence(event, override.originalStart)
    if (intersectsRange(item, range)) results.push(item)
  }
  return results.sort((a, b) => a.start.getTime() - b.start.getTime())
}
export const expandEvents = (events: CalendarEvent[], range: CalendarRange) => events.flatMap((event) => expandEvent(event, range)).sort((a, b) => a.start.getTime() - b.start.getTime())
export function cancelOccurrence(event: CalendarEvent, originalStart: Date): CalendarEvent { return updateOverride(event, { originalStart, cancelled: true }) }
export function moveOccurrence(event: CalendarEvent, originalStart: Date, start: Date, end: Date): CalendarEvent { return updateOverride(event, { originalStart, start, end }) }
function updateOverride(event: CalendarEvent, value: OccurrenceOverride): CalendarEvent {
  const overrides = (event.schedule?.overrides ?? []).filter((item) => !sameInstant(item.originalStart, value.originalStart))
  return { ...event, schedule: { ...event.schedule, overrides: [...overrides, value] } }
}
export function validateEvent(event: CalendarEvent) {
  const errors: EventValidationError[] = []
  if (!event.id.trim()) errors.push('idRequired')
  if (!event.title.trim()) errors.push('titleRequired')
  if (!(event.start instanceof Date) || Number.isNaN(event.start.getTime())) errors.push('startInvalid')
  if (!(event.end instanceof Date) || Number.isNaN(event.end.getTime())) errors.push('endInvalid')
  if (event.end <= event.start) errors.push('endAfterStart')
  return { valid: errors.length === 0, errors }
}
export const eventsForDay = (events: CalendarOccurrence[], date: Date) => events.filter((event) => startOfDay(event.start) < addDays(startOfDay(date), 1) && event.end > startOfDay(date))
