<script setup lang="ts">
import { computed, ref, watch } from "vue";
import MdAgenda from "./MdAgenda.vue";
import MdDayView from "./MdDayView.vue";
import MdMonthView from "./MdMonthView.vue";
import MdWeekView from "./MdWeekView.vue";
import { addDays, navigateDate, rangeForView } from "../core/date";
import { useMazeyDaySpan } from "../plugin/context";
import type {
  CalendarDay, CalendarEvent, CalendarOccurrence, CalendarRange, CalendarView,
} from "../types";

const props = withDefaults(defineProps<{ events:CalendarEvent[]; modelValue?:Date; view?:CalendarView }>(), {
  modelValue: () => new Date(),
  view: undefined,
});
const emit = defineEmits<{
  "update:modelValue":[date:Date]
  "update:view":[view:CalendarView]
  eventClick:[event:CalendarOccurrence]
  eventCreateRequest:[day:CalendarDay]
  dayClick:[day:CalendarDay]
  viewChange:[view:CalendarView]
  rangeChange:[range:CalendarRange]
}>();
defineSlots<{
  toolbar?(props:{ date:Date; view:CalendarView; navigate:(direction:-1|1)=>void; setView:(view:CalendarView)=>void }):unknown
  event?(props:{ event:CalendarOccurrence; day:CalendarDay }):unknown
  "agenda-event"?(props:{ event:CalendarOccurrence }):unknown
  empty?(props:{ day?:CalendarDay }):unknown
}>();

const ds = useMazeyDaySpan();
const date = ref(new Date(props.modelValue));
watch(() => props.modelValue, (value) => { date.value = new Date(value); });
const title = computed(() => ds.formatDate(date.value, { month:"long", year:"numeric" }));
const view = computed(() => props.view ?? ds.defaults.view);
const component = computed(() => ({ month:MdMonthView, week:MdWeekView, day:MdDayView, agenda:MdAgenda })[view.value]);

function visibleRange(targetView = view.value) {
  const range = rangeForView(date.value, targetView, ds.currentLocale.value.firstDayOfWeek);
  return targetView === "agenda"
    ? { ...range, end:addDays(range.start, ds.defaults.agendaDays) }
    : range;
}
function emitRange(targetView = view.value) {
  emit("rangeChange", visibleRange(targetView));
}
function navigate(direction:-1|1) {
  date.value = view.value === "agenda"
    ? addDays(date.value, direction * ds.defaults.agendaDays)
    : navigateDate(date.value, view.value, direction);
  emit("update:modelValue", date.value);
  emitRange();
}
function setView(view:CalendarView) {
  emit("update:view", view);
  emit("viewChange", view);
  emitRange(view);
}
function today() {
  date.value = new Date();
  emit("update:modelValue", date.value);
  emitRange();
}
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
      </template><template v-if="$slots['agenda-event']" #agenda-event="slotProps">
        <slot name="agenda-event" v-bind="slotProps" />
      </template><template v-if="$slots.empty" #empty="slotProps">
        <slot name="empty" v-bind="slotProps" />
      </template>
    </component>
  </section>
</template>
