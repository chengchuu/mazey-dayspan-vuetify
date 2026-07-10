import MdAgenda from './MdAgenda.vue'
import MdCalendar from './MdCalendar.vue'
import MdCalendarApp from './MdCalendarApp.vue'
import MdDayView from './MdDayView.vue'
import MdEventDialog from './MdEventDialog.vue'
import MdMonthView from './MdMonthView.vue'
import MdScheduleEditor from './MdScheduleEditor.vue'
import MdWeekView from './MdWeekView.vue'

// Public names retained from dayspan-vuetify. Implementation filenames are internal.
export const DsAgenda = MdAgenda
export const DsCalendar = MdCalendar
export const DsCalendarApp = MdCalendarApp
export const DsDayTimes = MdDayView
export const DsDaysView = MdWeekView
export const DsEvent = MdEventDialog
export const DsEventDialog = MdEventDialog
export const DsSchedule = MdScheduleEditor
export const DsWeeksView = MdMonthView

export const components = [
  DsAgenda,
  DsCalendar,
  DsCalendarApp,
  DsDayTimes,
  DsDaysView,
  DsEvent,
  DsEventDialog,
  DsSchedule,
  DsWeeksView,
]
