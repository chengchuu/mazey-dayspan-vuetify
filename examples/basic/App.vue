<script setup lang="ts">
import { ref } from 'vue'
import { DsCalendar, type CalendarEvent } from 'mazey-dayspan-vuetify'
const events = ref<CalendarEvent[]>([{ id:'planning', title:'Planning', start:new Date(), end:new Date(Date.now() + 3_600_000) }])
</script>
<template><DsCalendar :events="events" view="month" /></template>
