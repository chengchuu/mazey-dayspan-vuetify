<script setup lang="ts">
import { computed } from 'vue'
import { daysInRange, rangeForView } from '../core/date'
import { eventsForDay, expandEvents } from '../core/recurrence'
import { useMazeyDaySpan } from '../plugin/context'
import type { CalendarDay, CalendarEvent, CalendarOccurrence } from '../types'
const props = defineProps<{ date: Date; events: CalendarEvent[] }>()
const emit = defineEmits<{ dayClick:[day:CalendarDay]; eventClick:[event:CalendarOccurrence]; eventCreateRequest:[day:CalendarDay] }>()
defineSlots<{ event?(props:{ event:CalendarOccurrence; day:CalendarDay }):unknown; 'date-title'?(props:{ day:CalendarDay }):unknown; empty?(props:{ day:CalendarDay }):unknown }>()
const dayspan = useMazeyDaySpan()
const range = computed(() => rangeForView(props.date, 'month', dayspan.currentLocale.value.firstDayOfWeek))
const days = computed(() => daysInRange(range.value, props.date.getMonth()))
const occurrences = computed(() => expandEvents(props.events, range.value))
const weekdayNames = computed(() => Array.from({length:7}, (_, index) => {
  const day = new Date(2024, 0, 7 + ((dayspan.currentLocale.value.firstDayOfWeek + index) % 7))
  return dayspan.formatDate(day, { weekday:'short' })
}))
function requestCreateWithKeyboard(event:{ shiftKey:boolean; key:string; preventDefault():void }, day:CalendarDay) {
  if (!event.shiftKey || (event.key !== 'Enter' && event.key !== ' ')) return
  event.preventDefault()
  emit('eventCreateRequest', day)
}
</script>
<template>
  <div class="md-month" role="grid" :aria-label="dayspan.t('month')">
    <div v-for="name in weekdayNames" :key="name" class="md-month__weekday" role="columnheader">
      {{ name }}
    </div>
    <div v-for="day in days" :key="day.key" class="md-month__day" :class="{'is-today':day.isToday,'is-outside':!day.inCurrentPeriod}" role="gridcell">
      <button class="md-month__date" type="button" :aria-label="dayspan.formatDate(day.date,{dateStyle:'full'})" aria-keyshortcuts="Shift+Enter Shift+Space" @click="emit('dayClick',day)" @dblclick="emit('eventCreateRequest',day)" @keydown="requestCreateWithKeyboard($event,day)">
        <slot name="date-title" :day="day">
          {{ day.date.getDate() }}
        </slot>
      </button>
      <div class="md-month__events">
        <template v-if="eventsForDay(occurrences,day.date).length">
          <button v-for="event in eventsForDay(occurrences,day.date)" :key="event.id" class="md-event" type="button" :style="{'--md-event-color':event.color||dayspan.defaults.eventColor}" :aria-label="`${event.title}, ${dayspan.formatDate(event.start,{timeStyle:'short'})}`" @click="emit('eventClick',event)">
            <slot name="event" :event="event" :day="day">
              <span class="md-event__title">{{ event.title }}</span>
            </slot>
          </button>
        </template>
        <slot v-else name="empty" :day="day" />
      </div>
    </div>
  </div>
</template>
