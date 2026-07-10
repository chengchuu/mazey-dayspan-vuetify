<script setup lang="ts">
import { computed } from 'vue'; import { useMazeyDaySpan } from '../plugin/context'; import type { EventSchedule,RecurrenceFrequency } from '../types'
const props=defineProps<{modelValue:EventSchedule}>(); const emit=defineEmits<{ 'update:modelValue':[schedule:EventSchedule]; change:[schedule:EventSchedule] }>(); defineSlots<{before?(props:{schedule:EventSchedule}):unknown;after?(props:{schedule:EventSchedule}):unknown}>(); const ds=useMazeyDaySpan(); const recurrence=computed(()=>props.modelValue.recurrence??{frequency:'daily' as const,interval:1}); function update(value:Partial<typeof recurrence.value>){const schedule={...props.modelValue,recurrence:{...recurrence.value,...value}};emit('update:modelValue',schedule);emit('change',schedule)}
</script>
<template>
  <fieldset class="md-schedule">
    <legend>{{ ds.t('recurrence') }}</legend><slot name="before" :schedule="modelValue" /><label>{{ ds.t('frequency') }}<select :value="recurrence.frequency" @change="update({frequency:($event.target as HTMLSelectElement).value as RecurrenceFrequency})"><option v-for="frequency in ['daily','weekly','monthly','yearly'] as const" :key="frequency" :value="frequency">{{ ds.t(frequency) }}</option></select></label><label>{{ ds.t('interval') }}<input type="number" min="1" :value="recurrence.interval??1" @input="update({interval:Number(($event.target as HTMLInputElement).value)})"></label><slot name="after" :schedule="modelValue" />
  </fieldset>
</template>
