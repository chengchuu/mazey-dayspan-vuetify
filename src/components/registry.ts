import type { Component } from 'vue'
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
} from './index'

export const componentEntries = [
  ['DsAgenda', DsAgenda],
  ['DsCalendar', DsCalendar],
  ['DsCalendarApp', DsCalendarApp],
  ['DsDayTimes', DsDayTimes],
  ['DsDaysView', DsDaysView],
  ['DsEvent', DsEvent],
  ['DsEventDialog', DsEventDialog],
  ['DsSchedule', DsSchedule],
  ['DsWeeksView', DsWeeksView],
] as const satisfies ReadonlyArray<readonly [string, Component]>
