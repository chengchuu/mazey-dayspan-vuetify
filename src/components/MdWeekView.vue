<script setup lang="ts">
import { computed } from 'vue'
import { daysInRange, rangeForView, startOfDay } from '../core/date'
import { eventsForDay, expandEvents } from '../core/recurrence'
import { layoutOverlaps } from '../core/overlap'
import { useMazeyDaySpan } from '../plugin/context'
import type { CalendarDay, CalendarEvent, CalendarOccurrence } from '../types'
const props=defineProps<{date:Date;events:CalendarEvent[];singleDay?:boolean}>(); const emit=defineEmits<{dayClick:[day:CalendarDay];eventClick:[event:CalendarOccurrence];eventCreateRequest:[day:CalendarDay]}>()
defineSlots<{event?(props:{event:CalendarOccurrence;day:CalendarDay}):unknown}>()
const ds=useMazeyDaySpan(); const range=computed(()=>rangeForView(props.date,props.singleDay?'day':'week',ds.currentLocale.value.firstDayOfWeek)); const days=computed(()=>daysInRange(range.value,props.date.getMonth())); const occurrences=computed(()=>expandEvents(props.events,range.value))
function layouts(day:CalendarDay){return layoutOverlaps(eventsForDay(occurrences.value,day.date).filter(event=>!event.allDay))}
function style(event:CalendarOccurrence,column:number,columns:number){const base=startOfDay(event.start);const start=Math.max(0,(event.start.getTime()-base.getTime())/60_000);const duration=Math.max(30,(event.end.getTime()-event.start.getTime())/60_000);return{top:`${start/60*ds.defaults.hourHeight}px`,height:`${duration/60*ds.defaults.hourHeight}px`,left:`${column/columns*100}%`,width:`${100/columns}%`,'--md-event-color':event.color||ds.defaults.eventColor}}
</script>
<template>
  <div class="md-time-grid md-time-grid--week" role="grid" :aria-label="ds.t(singleDay ? 'day' : 'week')">
    <section v-for="day in days" :key="day.key" class="md-time-grid__day" :class="{'is-today':day.isToday}" role="gridcell">
      <button type="button" class="md-time-grid__heading" @click="emit('dayClick',day)" @dblclick="emit('eventCreateRequest',day)">
        {{ ds.formatDate(day.date,{weekday:'short',day:'numeric'}) }}
      </button><div class="md-time-grid__track" :style="{height:`${24*ds.defaults.hourHeight}px`}">
        <button v-for="item in layouts(day)" :key="item.event.id" type="button" class="md-time-event" :style="style(item.event,item.column,item.columns)" @click="emit('eventClick',item.event)">
          <slot name="event" :event="item.event" :day="day">
            {{ item.event.title }}
          </slot>
        </button>
      </div>
    </section>
  </div>
</template>
