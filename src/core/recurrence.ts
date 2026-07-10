import type { CalendarEvent, CalendarOccurrence, CalendarRange, EventValidationError, OccurrenceOverride, RecurrenceRule } from '../types'
import { addDays, DAY_MS, startOfDay, startOfWeek } from './date'

const sameInstant = (a: Date, b: Date) => a.getTime() === b.getTime()
const matchesList = (value: number, list?: number[]) => !list?.length || list.includes(value)
function advance(date: Date, rule: RecurrenceRule) {
  const interval = Math.max(1, rule.interval ?? 1)
  if (rule.frequency === 'daily' || rule.frequency === 'weekly') return addDays(date, interval * (rule.frequency === 'weekly' ? 7 : 1))
  const next = new Date(date)
  if (rule.frequency === 'monthly') next.setMonth(next.getMonth() + interval)
  else next.setFullYear(next.getFullYear() + interval)
  return next
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
function ruleMatches(date: Date, recurrenceStart: Date, rule: RecurrenceRule) {
  return matchesWeeklyInterval(date, recurrenceStart, rule)
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
export function expandEvent(event: CalendarEvent, range: CalendarRange, limit = 1000): CalendarOccurrence[] {
  const schedule = event.schedule
  if (!schedule?.recurrence) return event.end > range.start && event.start < range.end ? [occurrence(event, event.start)] : []
  const rule = schedule.recurrence
  const excluded = new Set((schedule.exclusions ?? []).map((date) => date.toISOString()))
  const cancelled = new Set((schedule.overrides ?? []).filter((item) => item.cancelled).map((item) => item.originalStart.toISOString()))
  const results: CalendarOccurrence[] = []
  let cursor = new Date(event.start)
  let produced = 0
  for (let checked = 0; checked < limit && cursor < range.end; checked++) {
    if (rule.until && cursor > rule.until) break
    if (ruleMatches(cursor, event.start, rule)) {
      produced++
      if ((!rule.count || produced <= rule.count) && !excluded.has(cursor.toISOString()) && !cancelled.has(cursor.toISOString()) && event.end.getTime() - event.start.getTime() + cursor.getTime() > range.start.getTime()) results.push(occurrence(event, cursor))
      if (rule.count && produced >= rule.count) break
    }
    cursor = rule.byWeekday?.length && rule.frequency === 'weekly' ? addDays(cursor, 1) : advance(cursor, rule)
  }
  for (const included of schedule.inclusions ?? []) if (included >= range.start && included < range.end && !results.some((item) => sameInstant(item.originalStart, included))) results.push(occurrence(event, included))
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
