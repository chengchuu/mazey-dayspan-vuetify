export interface MazeyLocale {
  code: string
  firstDayOfWeek: number
  messages: {
    today: string; previous: string; next: string; month: string; week: string; day: string; agenda: string
    noEvents: string; createEvent: string; editEvent: string; deleteEvent: string; save: string; cancel: string
    title: string; start: string; end: string; description: string; location: string; allDay: string
    recurrence: string; frequency: string; interval: string; daily: string; weekly: string; monthly: string; yearly: string
    titleRequired: string; endAfterStart: string; close: string
  }
}
export type MazeyLocaleOverride = { code?: string; firstDayOfWeek?: number; messages?: Partial<MazeyLocale['messages']> }
