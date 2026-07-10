import type { CalendarDay, CalendarRange, CalendarView } from '../types'

export const DAY_MS = 86_400_000
export const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
export const addDays = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
export const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
export const sameDay = (a: Date, b: Date) => dateKey(a) === dateKey(b)

export function startOfWeek(date: Date, firstDay = 1) {
  const day = startOfDay(date)
  return addDays(day, -((day.getDay() - firstDay + 7) % 7))
}
export function rangeForView(date: Date, view: CalendarView, firstDay = 1): CalendarRange {
  if (view === 'day') return { start: startOfDay(date), end: addDays(startOfDay(date), 1) }
  if (view === 'week') { const start = startOfWeek(date, firstDay); return { start, end: addDays(start, 7) } }
  if (view === 'agenda') { const start = startOfDay(date); return { start, end: addDays(start, 30) } }
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
  const start = startOfWeek(monthStart, firstDay)
  return { start, end: addDays(start, 42) }
}
export function daysInRange(range: CalendarRange, currentMonth: number, now = new Date()): CalendarDay[] {
  const days: CalendarDay[] = []
  for (let date = range.start; date < range.end; date = addDays(date, 1)) {
    days.push({ date, key: dateKey(date), isToday: sameDay(date, now), inCurrentPeriod: date.getMonth() === currentMonth })
  }
  return days
}
export function navigateDate(date: Date, view: CalendarView, direction: -1 | 1) {
  if (view === 'month') return new Date(date.getFullYear(), date.getMonth() + direction, 1)
  return addDays(date, direction * (view === 'week' ? 7 : view === 'agenda' ? 30 : 1))
}
