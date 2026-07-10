<script setup lang="ts">
import { ref } from 'vue'; import { MdCalendarApp,MdScheduleEditor,useMazeyDaySpan,type CalendarEvent,type CalendarView,type EventSchedule } from 'mazey-dayspan-vuetify'
const ds=useMazeyDaySpan();const view=ref<CalendarView>('month');const dark=ref(false);const events=ref<CalendarEvent[]>([{id:'welcome',title:'Project planning',start:new Date(2026,6,10,9),end:new Date(2026,6,10,10,30),color:'#1565c0',description:'A safe plain-text event.'},{id:'weekly',title:'Weekly review',start:new Date(2026,6,6,14),end:new Date(2026,6,6,15),color:'#7b1fa2',schedule:{recurrence:{frequency:'weekly',byWeekday:[1],count:12}}}]);const schedule=ref<EventSchedule>({recurrence:{frequency:'weekly',interval:1,byWeekday:[1]}});function upsert(event:CalendarEvent){const index=events.value.findIndex(item=>item.id===event.id);if(index<0)events.value.push(event);else events.value.splice(index,1,event)}function remove(event:CalendarEvent){events.value=events.value.filter(item=>item.id!==event.id)}
</script>
<template>
  <VApp :theme="dark?'dark':'light'">
    <VMain>
      <main class="playground">
        <header><div><h1>mazey-dayspan-vuetify</h1><p>Vue 3 calendar and recurrence playground</p></div><VSelect label="Locale" :items="['en','zh-CN']" :model-value="ds.locale.value" @update:model-value="ds.setLocale($event)" /><VSwitch v-model="dark" label="Dark mode" /></header><MdCalendarApp v-model:view="view" :date="new Date(2026,6,10)" :events="events" @event-create="upsert" @event-update="upsert" @event-remove="remove">
          <template #event="{event}">
            <strong>● {{ event.title }}</strong>
          </template>
        </MdCalendarApp><section><h2>Recurrence editor</h2><MdScheduleEditor v-model="schedule" /><pre>{{ schedule }}</pre></section>
      </main>
    </VMain>
  </VApp>
</template>
<style>.playground{max-width:1200px;margin:auto;padding:1rem}.playground>header{display:flex;align-items:center;gap:1rem;flex-wrap:wrap}.playground>header>div{flex:1}.playground h1{margin-bottom:0}.playground header p{margin-top:.2rem}.playground .v-input{max-width:12rem}.playground section{margin-top:2rem}pre{padding:1rem;overflow:auto;background:rgba(127,127,127,.12)}</style>
