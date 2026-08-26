<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  resolveThemePreference,
  setThemePreference,
  type ResolvedTheme,
} from 'mazey'
import { DsCalendar, type CalendarEvent } from 'mazey-dayspan-vuetify'

const themeStorageKey = 'MAZEY_DAYSPAN_VUETIFY_THEME'
const theme = ref<ResolvedTheme>(resolveThemePreference(themeStorageKey).value)
const dark = computed({
  get: () => theme.value === 'dark',
  set: (enabled: boolean) => {
    theme.value = enabled ? 'dark' : 'light'
    setThemePreference(themeStorageKey, theme.value)
  },
})
const events = ref<CalendarEvent[]>([{ id:'planning', title:'Planning', start:new Date(), end:new Date(Date.now() + 3_600_000) }])
</script>

<template>
  <VApp :theme="theme">
    <VMain>
      <VSwitch v-model="dark" label="Dark mode" />
      <DsCalendar :events="events" view="month" />
    </VMain>
  </VApp>
</template>
