<script setup lang="ts">
import MdWeekView from './MdWeekView.vue'; import type { CalendarDay,CalendarEvent,CalendarOccurrence } from '../types'
defineProps<{date:Date;events:CalendarEvent[]}>(); const emit=defineEmits<{dayClick:[day:CalendarDay];eventClick:[event:CalendarOccurrence];eventCreateRequest:[day:CalendarDay]}>(); defineSlots<{event?(props:{event:CalendarOccurrence;day:CalendarDay}):unknown}>()
</script>
<template>
  <MdWeekView class="md-time-grid--day" :date="date" :events="events" single-day @day-click="emit('dayClick',$event)" @event-click="emit('eventClick',$event)" @event-create-request="emit('eventCreateRequest',$event)">
    <template #event="slotProps">
      <slot name="event" v-bind="slotProps">
        {{ slotProps.event.title }}
      </slot>
    </template>
  </MdWeekView>
</template>
<style scoped>.md-time-grid--day :deep(.md-time-grid__day){min-width:100%}</style>
