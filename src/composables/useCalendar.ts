import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { navigateDate, rangeForView } from '../core/date'
import type { CalendarView } from '../types'
export function useCalendar(initialDate: MaybeRefOrGetter<Date>, initialView: CalendarView = 'month', firstDay = 1) {
  const date = ref(new Date(toValue(initialDate))); const view = ref<CalendarView>(initialView)
  const range = computed(() => rangeForView(date.value, view.value, firstDay))
  const navigate = (direction: -1 | 1) => { date.value = navigateDate(date.value, view.value, direction) }
  return { date, view, range, navigate, today: () => { date.value = new Date() } }
}
