<script setup lang="ts">
import { reactive, watch } from 'vue'
import { VBtn, VCard, VCardActions, VCardText, VCardTitle, VCheckbox, VDialog, VSpacer, VTextField, VTextarea } from 'vuetify/components'
import { useMazeyDaySpan } from '../plugin/context'
import { validateEvent } from '../core/recurrence'
import { fromLocalInput, toLocalInput } from '../utils/dateInput'
import type { CalendarEvent } from '../types'
const props = withDefaults(defineProps<{ modelValue:boolean; event?:CalendarEvent; initialDate?:Date }>(), { event:undefined, initialDate:undefined })
const emit = defineEmits<{ 'update:modelValue':[open:boolean]; eventCreate:[event:CalendarEvent]; eventUpdate:[event:CalendarEvent]; eventRemove:[event:CalendarEvent] }>()
defineSlots<{ actions?(props:{ save:()=>void; close:()=>void; remove:()=>void; valid:boolean }):unknown }>()
const ds = useMazeyDaySpan(); const draft = reactive({ id:'', title:'', start:'', end:'', description:'', location:'', allDay:false }); const errors = reactive<string[]>([])
watch(() => [props.modelValue, props.event, props.initialDate] as const, () => {
  if (!props.modelValue) return
  const start = props.event?.start ?? props.initialDate ?? new Date(); const end = props.event?.end ?? new Date(start.getTime() + 3_600_000)
  Object.assign(draft, { id:props.event?.id ?? globalThis.crypto.randomUUID(), title:props.event?.title ?? '', start:toLocalInput(start), end:toLocalInput(end), description:props.event?.description ?? '', location:props.event?.location ?? '', allDay:props.event?.allDay ?? false }); errors.splice(0)
}, { immediate:true })
const close = () => emit('update:modelValue', false)
function value():CalendarEvent { return { ...props.event, ...draft, start:fromLocalInput(draft.start), end:fromLocalInput(draft.end) } }
function save() { const event=value(); const result=validateEvent(event); errors.splice(0, errors.length, ...result.errors); if(!result.valid)return; if(props.event)emit('eventUpdate',event); else emit('eventCreate',event); close() }
function remove() { if(props.event){ emit('eventRemove',props.event); close() } }
</script>
<template>
  <VDialog :model-value="modelValue" max-width="640" @update:model-value="emit('update:modelValue', $event)">
    <VCard>
      <VCardTitle>{{ ds.t(event ? 'editEvent' : 'createEvent') }}</VCardTitle><VCardText>
        <form class="md-event-form" @submit.prevent="save">
          <VTextField v-model="draft.title" :label="ds.t('title')" autofocus /><VTextField v-model="draft.start" type="datetime-local" :label="ds.t('start')" /><VTextField v-model="draft.end" type="datetime-local" :label="ds.t('end')" /><VTextField v-model="draft.location" :label="ds.t('location')" /><VTextarea v-model="draft.description" :label="ds.t('description')" /><VCheckbox v-model="draft.allDay" :label="ds.t('allDay')" /><p v-for="error in errors" :key="error" role="alert" class="md-error">
            {{ error === 'titleRequired' ? ds.t('titleRequired') : ds.t('endAfterStart') }}
          </p>
        </form>
      </VCardText>
      <VCardActions>
        <slot name="actions" :save="save" :close="close" :remove="remove" :valid="!errors.length">
          <VBtn v-if="event" color="error" variant="text" @click="remove">
            {{ ds.t('deleteEvent') }}
          </VBtn><VSpacer /><VBtn variant="text" @click="close">
            {{ ds.t('cancel') }}
          </VBtn><VBtn color="primary" @click="save">
            {{ ds.t('save') }}
          </VBtn>
        </slot>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
