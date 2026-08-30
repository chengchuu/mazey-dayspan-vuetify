<script setup lang="ts">
import { computed } from "vue"; import { addDays, rangeForView } from "../core/date"; import { expandEvents } from "../core/recurrence"; import { useMazeyDaySpan } from "../plugin/context"; import type { CalendarDay,CalendarEvent,CalendarOccurrence } from "../types";
const props=defineProps<{ date:Date;events:CalendarEvent[];days?:number }>(); const emit=defineEmits<{ eventClick:[event:CalendarOccurrence] }>(); defineSlots<{ "agenda-event"?(props:{ event:CalendarOccurrence }):unknown;empty?(props:{ day?:CalendarDay }):unknown }>(); const ds=useMazeyDaySpan(); const occurrences=computed(()=>{const range=rangeForView(props.date,"agenda");range.end=addDays(range.start,props.days??ds.defaults.agendaDays);return expandEvents(props.events,range);});
</script>
<template>
  <div class="md-agenda" role="list" :aria-label="ds.t('agenda')">
    <slot v-if="!occurrences.length" name="empty">
      <p class="md-empty">
        {{ ds.t('noEvents') }}
      </p>
    </slot>
    <div v-for="event in occurrences" :key="event.id" role="listitem">
      <button type="button" class="md-agenda__event" @click="emit('eventClick',event)">
        <slot name="agenda-event" :event="event">
          <time>{{ ds.formatDate(event.start,{dateStyle:'medium',timeStyle:event.allDay?undefined:'short'}) }}</time><span><strong>{{ event.title }}</strong><small v-if="event.description">{{ event.description }}</small></span>
        </slot>
      </button>
    </div>
  </div>
</template>
