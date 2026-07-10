export type CalendarView = 'month' | 'week' | 'day' | 'agenda'
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface CalendarRange { start: Date; end: Date }
export interface CalendarDay { date: Date; key: string; isToday: boolean; inCurrentPeriod: boolean }
export interface RecurrenceRule {
  frequency: RecurrenceFrequency
  interval?: number
  byWeekday?: Weekday[]
  weekStart?: Weekday
  byMonthDay?: number[]
  byMonth?: number[]
  count?: number
  until?: Date
}
export interface OccurrenceOverride { originalStart: Date; start?: Date; end?: Date; cancelled?: boolean }
export interface EventSchedule {
  recurrence?: RecurrenceRule
  inclusions?: Date[]
  exclusions?: Date[]
  overrides?: OccurrenceOverride[]
}
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  description?: string
  location?: string
  color?: string
  busy?: boolean
  schedule?: EventSchedule
  metadata?: Readonly<Record<string, unknown>>
}
export interface CalendarOccurrence extends CalendarEvent { sourceEventId: string; originalStart: Date }
export interface EventMovePayload { event: CalendarEvent; start: Date; end: Date; occurrenceStart?: Date }
export type EventValidationError = 'idRequired' | 'titleRequired' | 'startInvalid' | 'endInvalid' | 'endAfterStart'
export interface EventValidationResult { valid: boolean; errors: EventValidationError[] }
