import type { CalendarOccurrence } from '../types'
export interface EventLayout { event: CalendarOccurrence; column: number; columns: number }
export function layoutOverlaps(events: CalendarOccurrence[]): EventLayout[] {
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime() || a.end.getTime() - b.end.getTime())
  const active: EventLayout[] = []; const result: EventLayout[] = []
  for (const event of sorted) {
    for (let index = active.length - 1; index >= 0; index--) if (active[index]!.event.end <= event.start) active.splice(index, 1)
    const used = new Set(active.map((item) => item.column)); let column = 0
    while (used.has(column)) column++
    const item = { event, column, columns: Math.max(column + 1, active.length + 1) }; active.push(item); result.push(item)
    for (const current of active) current.columns = Math.max(current.columns, active.length)
  }
  return result
}
