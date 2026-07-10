<script setup lang="ts">
import { ref } from 'vue'
import { MdCalendar, type CalendarEvent } from 'mazey-dayspan-vuetify'
const events = ref<CalendarEvent[]>([{ id:'planning', title:'Planning', start:new Date(), end:new Date(Date.now() + 3_600_000) }])
</script>
<template><MdCalendar :events="events" view="month" /></template>
