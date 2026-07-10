<script setup lang="ts">
import { ref } from 'vue'
import MdCalendar from './MdCalendar.vue'
import MdEventDialog from './MdEventDialog.vue'
import type { CalendarDay, CalendarEvent, CalendarOccurrence, CalendarView } from '../types'
const props = withDefaults(defineProps<{ events: CalendarEvent[]; view?: CalendarView; date?: Date }>(), { view:'month', date:() => new Date() })
const emit = defineEmits<{ 'update:view':[view:CalendarView]; eventCreate:[event:CalendarEvent]; eventUpdate:[event:CalendarEvent]; eventRemove:[event:CalendarEvent]; eventClick:[event:CalendarOccurrence] }>()
defineSlots<{ event?(props:{event:CalendarOccurrence;day:import('../types').CalendarDay}):unknown; 'agenda-event'?(props:{event:CalendarOccurrence}):unknown; empty?():unknown }>()
const open = ref(false); const editing = ref<CalendarEvent>(); const creationDate = ref<Date>()
function create(day:CalendarDay) { editing.value = undefined; creationDate.value = day.date; open.value = true }
function edit(event:CalendarOccurrence) { editing.value = props.events.find((item) => item.id === event.sourceEventId); open.value = true; emit('eventClick', event) }
</script>
<template>
  <MdCalendar :events="events" :view="view" :model-value="date" @update:view="emit('update:view', $event)" @event-click="edit" @event-create-request="create">
    <template #event="slotProps">
      <slot name="event" v-bind="slotProps">
        {{ slotProps.event.title }}
      </slot>
    </template>
    <template #agenda-event="slotProps">
      <slot name="agenda-event" v-bind="slotProps" />
    </template>
    <template #empty>
      <slot name="empty" />
    </template>
  </MdCalendar>
  <MdEventDialog v-model="open" :event="editing" :initial-date="creationDate" @event-create="emit('eventCreate', $event)" @event-update="emit('eventUpdate', $event)" @event-remove="emit('eventRemove', $event)" />
</template>
