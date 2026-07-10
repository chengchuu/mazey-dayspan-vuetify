import { createApp } from 'vue'
import { describe, expect, it } from 'vitest'
import MazeyDaySpanVuetify from '../../src/plugin'

const componentNames = [
  'MdAgenda',
  'MdCalendar',
  'MdCalendarApp',
  'MdDayView',
  'MdEventDialog',
  'MdMonthView',
  'MdScheduleEditor',
  'MdWeekView',
]

describe('MazeyDaySpanVuetify plugin', () => {
  it('globally registers every component under its explicit public name', () => {
    const app = createApp({})

    app.use(MazeyDaySpanVuetify)

    expect(componentNames.every((name) => app.component(name) !== undefined)).toBe(true)
    expect(app.component('undefined')).toBeUndefined()
  })
})
