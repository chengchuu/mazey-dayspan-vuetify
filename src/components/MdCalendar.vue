<script setup lang="ts">
import { computed, ref, watch } from 'vue'; import MdMonthView from './MdMonthView.vue'; import MdWeekView from './MdWeekView.vue'; import MdDayView from './MdDayView.vue'; import MdAgenda from './MdAgenda.vue'; import { navigateDate,rangeForView } from '../core/date'; import { useMazeyDaySpan } from '../plugin/context'; import type { CalendarDay,CalendarEvent,CalendarOccurrence,CalendarRange,CalendarView } from '../types'
const props=withDefaults(defineProps<{events:CalendarEvent[];modelValue?:Date;view?:CalendarView}>(),{modelValue:()=>new Date(),view:'month'});const emit=defineEmits<{'update:modelValue':[date:Date];'update:view':[view:CalendarView];eventClick:[event:CalendarOccurrence];eventCreateRequest:[day:CalendarDay];dayClick:[day:CalendarDay];viewChange:[view:CalendarView];rangeChange:[range:CalendarRange]}>();defineSlots<{toolbar?(props:{date:Date;view:CalendarView;navigate:(direction:-1|1)=>void;setView:(view:CalendarView)=>void}):unknown;event?(props:{event:CalendarOccurrence;day:CalendarDay}):unknown;'agenda-event'?(props:{event:CalendarOccurrence}):unknown;empty?():unknown}>();const ds=useMazeyDaySpan();const date=ref(new Date(props.modelValue));watch(()=>props.modelValue,value=>date.value=new Date(value));const title=computed(()=>ds.formatDate(date.value,{month:'long',year:'numeric'}));const component=computed(()=>({month:MdMonthView,week:MdWeekView,day:MdDayView,agenda:MdAgenda})[props.view]);function navigate(direction:-1|1){date.value=navigateDate(date.value,props.view,direction);emit('update:modelValue',date.value);emit('rangeChange',rangeForView(date.value,props.view,ds.currentLocale.value.firstDayOfWeek))}function setView(view:CalendarView){emit('update:view',view);emit('viewChange',view);emit('rangeChange',rangeForView(date.value,view,ds.currentLocale.value.firstDayOfWeek))}function today(){date.value=new Date();emit('update:modelValue',date.value)}
</script>
<template>
  <section class="md-calendar">
    <slot name="toolbar" :date="date" :view="view" :navigate="navigate" :set-view="setView">
      <header class="md-toolbar">
        <div class="md-toolbar__nav">
          <button type="button" :aria-label="ds.t('previous')" @click="navigate(-1)">
            ‹
          </button><button type="button" @click="today">
            {{ ds.t('today') }}
          </button><button type="button" :aria-label="ds.t('next')" @click="navigate(1)">
            ›
          </button>
        </div><h2>{{ title }}</h2><div class="md-toolbar__views">
          <button v-for="item in ['month','week','day','agenda'] as const" :key="item" type="button" :aria-pressed="view===item" @click="setView(item)">
            {{ ds.t(item) }}
          </button>
        </div>
      </header>
    </slot><component :is="component" :date="date" :events="events" @event-click="emit('eventClick',$event)" @event-create-request="emit('eventCreateRequest',$event)" @day-click="emit('dayClick',$event)">
      <template #event="slotProps">
        <slot name="event" v-bind="slotProps">
          {{ slotProps.event.title }}
        </slot>
      </template><template #agenda-event="slotProps">
        <slot name="agenda-event" v-bind="slotProps" />
      </template><template #empty>
        <slot name="empty" />
      </template>
    </component>
  </section>
</template>
