import type { Component } from 'vue'
import {
  MdAgenda,
  MdCalendar,
  MdCalendarApp,
  MdDayView,
  MdEventDialog,
  MdMonthView,
  MdScheduleEditor,
  MdWeekView,
} from './index'

export const componentEntries = [
  ['MdAgenda', MdAgenda],
  ['MdCalendar', MdCalendar],
  ['MdCalendarApp', MdCalendarApp],
  ['MdDayView', MdDayView],
  ['MdEventDialog', MdEventDialog],
  ['MdMonthView', MdMonthView],
  ['MdScheduleEditor', MdScheduleEditor],
  ['MdWeekView', MdWeekView],
] as const satisfies ReadonlyArray<readonly [string, Component]>
