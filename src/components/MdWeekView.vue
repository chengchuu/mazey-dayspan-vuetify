<script setup lang="ts">
import { computed } from "vue";
import {
  addDays, daysInRange, rangeForView, startOfDay,
} from "../core/date";
import { eventsForDay, expandEvents } from "../core/recurrence";
import { layoutOverlaps } from "../core/overlap";
import { useMazeyDaySpan } from "../plugin/context";
import type { CalendarDay, CalendarEvent, CalendarOccurrence } from "../types";

const props = defineProps<{ date:Date; events:CalendarEvent[]; singleDay?:boolean }>();
const emit = defineEmits<{
  dayClick:[day:CalendarDay]
  eventClick:[event:CalendarOccurrence]
  eventCreateRequest:[day:CalendarDay]
}>();
defineSlots<{ event?(props:{ event:CalendarOccurrence; day:CalendarDay }):unknown }>();

const ds = useMazeyDaySpan();
const range = computed(() => rangeForView(props.date, props.singleDay ? "day" : "week", ds.currentLocale.value.firstDayOfWeek));
const days = computed(() => daysInRange(range.value, props.date.getMonth()));
const occurrences = computed(() => expandEvents(props.events, range.value));

function layouts(day:CalendarDay) {
  return layoutOverlaps(eventsForDay(occurrences.value, day.date).filter((event) => !event.allDay));
}
function allDayEvents(day:CalendarDay) {
  return eventsForDay(occurrences.value, day.date).filter((event) => event.allDay);
}
function minuteInDay(date:Date, dayStart:Date, dayEnd:Date) {
  if (date <= dayStart) return 0;
  if (date >= dayEnd) return 24 * 60;
  return date.getHours() * 60
    + date.getMinutes()
    + date.getSeconds() / 60
    + date.getMilliseconds() / 60_000;
}
function style(event:CalendarOccurrence, day:CalendarDay, column:number, columns:number) {
  const dayStart = startOfDay(day.date);
  const dayEnd = addDays(dayStart, 1);
  const startMinutes = minuteInDay(event.start, dayStart, dayEnd);
  const visibleMinutes = Math.max(0, minuteInDay(event.end, dayStart, dayEnd) - startMinutes);
  const durationMinutes = Math.min(Math.max(30, visibleMinutes), 24 * 60 - startMinutes);
  return {
    top: `${startMinutes / 60 * ds.defaults.hourHeight}px`,
    height: `${durationMinutes / 60 * ds.defaults.hourHeight}px`,
    left: `${column / columns * 100}%`,
    width: `${100 / columns}%`,
    "--md-event-color": event.color || ds.defaults.eventColor,
  };
}
function requestCreateWithKeyboard(event:{ shiftKey:boolean; key:string; preventDefault():void }, day:CalendarDay) {
  if (!event.shiftKey || (event.key !== "Enter" && event.key !== " ")) return;
  event.preventDefault();
  emit("eventCreateRequest", day);
}
</script>
<template>
  <div class="md-time-grid md-time-grid--week" role="grid" :aria-label="ds.t(singleDay ? 'day' : 'week')">
    <section v-for="day in days" :key="day.key" class="md-time-grid__day" :class="{'is-today':day.isToday}" role="gridcell">
      <button type="button" class="md-time-grid__heading" aria-keyshortcuts="Shift+Enter Shift+Space" @click="emit('dayClick',day)" @dblclick="emit('eventCreateRequest',day)" @keydown="requestCreateWithKeyboard($event,day)">
        {{ ds.formatDate(day.date,{weekday:'short',day:'numeric'}) }}
      </button><div class="md-time-grid__all-day">
        <button v-for="event in allDayEvents(day)" :key="event.id" type="button" class="md-event md-time-grid__all-day-event" :style="{'--md-event-color':event.color||ds.defaults.eventColor}" :aria-label="`${event.title}, ${ds.t('allDay')}`" @click="emit('eventClick',event)">
          <slot name="event" :event="event" :day="day">
            <span class="md-event__title">{{ event.title }}</span>
          </slot>
        </button>
      </div><div class="md-time-grid__track" :style="{height:`${24*ds.defaults.hourHeight}px`,'--md-hour-height':`${ds.defaults.hourHeight}px`}">
        <button v-for="item in layouts(day)" :key="item.event.id" type="button" class="md-time-event" :style="style(item.event,day,item.column,item.columns)" @click="emit('eventClick',item.event)">
          <slot name="event" :event="item.event" :day="day">
            {{ item.event.title }}
          </slot>
        </button>
      </div>
    </section>
  </div>
</template>
