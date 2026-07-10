import { createApp } from 'vue'
import { describe, expect, it } from 'vitest'
import {
  DsAgenda,
  DsCalendar,
  DsCalendarApp,
  DsDayTimes,
  DsDaysView,
  DsEvent,
  DsEventDialog,
  DsSchedule,
  DsWeeksView,
  components,
} from '../../src/components'
import MazeyDaySpanVuetify from '../../src/plugin'

const componentNames = [
  'DsAgenda',
  'DsCalendar',
  'DsCalendarApp',
  'DsDayTimes',
  'DsDaysView',
  'DsEvent',
  'DsEventDialog',
  'DsSchedule',
  'DsWeeksView',
]

describe('MazeyDaySpanVuetify plugin', () => {
  it('globally registers every component under its original public name', () => {
    const app = createApp({})

    app.use(MazeyDaySpanVuetify)

    expect(componentNames.every((name) => app.component(name) !== undefined)).toBe(true)
    expect(app.component('MdCalendar')).toBeUndefined()
  })

  it('exports the complete original-name component surface', () => {
    expect(components).toEqual([
      DsAgenda,
      DsCalendar,
      DsCalendarApp,
      DsDayTimes,
      DsDaysView,
      DsEvent,
      DsEventDialog,
      DsSchedule,
      DsWeeksView,
    ])
  })
})
