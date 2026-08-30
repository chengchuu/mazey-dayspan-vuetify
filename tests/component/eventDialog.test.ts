import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MdEventDialog from '../../src/components/MdEventDialog.vue'
import { createMazeyDaySpanContext, mazeyDaySpanKey } from '../../src/plugin/context'
import type { CalendarEvent } from '../../src/types'

const passthrough = { template:'<div><slot /></div>' }
const global = {
  provide: {
    [mazeyDaySpanKey as symbol]: createMazeyDaySpanContext(),
  },
  stubs: {
    VDialog: passthrough,
    VCard: passthrough,
    VCardTitle: passthrough,
    VCardText: passthrough,
    VCardActions: passthrough,
    VSpacer: true,
    VBtn: { template:'<button><slot /></button>' },
    VTextField: {
      props: ['modelValue', 'label'],
      emits: ['update:modelValue'],
      template:'<input :aria-label="label" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)">',
    },
    VTextarea: {
      props: ['modelValue', 'label'],
      template:'<textarea :aria-label="label" :value="modelValue" />',
    },
    VCheckbox: {
      props: ['modelValue', 'label'],
      template:'<input type="checkbox" :aria-label="label" :checked="modelValue">',
    },
  },
}

const event:CalendarEvent = {
  id: 'planning',
  title: 'Planning',
  start: new Date(2026, 6, 10, 14, 35),
  end: new Date(2026, 6, 10, 15, 35),
}

describe('MdEventDialog local date-time fields', () => {
  function mountDialog() {
    return mount(MdEventDialog, {
      props: { modelValue:true, event },
      global,
      slots: {
        actions: ({ save }:{ save:()=>void }) => h('button', { 'data-testid':'save', onClick:save }, 'Save'),
      },
    })
  }

  it('round-trips local wall-clock fields when saving', async () => {
    const wrapper = mountDialog()
    const start = wrapper.get<HTMLInputElement>('[aria-label="Start"]')

    expect(start.element.value).toBe('2026-07-10T14:35')

    await wrapper.get('[data-testid="save"]').trigger('click')

    const saved = wrapper.emitted('eventUpdate')?.[0]?.[0] as CalendarEvent
    expect([
      saved.start.getFullYear(),
      saved.start.getMonth(),
      saved.start.getDate(),
      saved.start.getHours(),
      saved.start.getMinutes(),
    ]).toEqual([2026, 6, 10, 14, 35])
  })

  it('rejects an impossible local date', async () => {
    const wrapper = mountDialog()
    const start = wrapper.get<HTMLInputElement>('[aria-label="Start"]')

    await start.setValue('2026-02-30T10:00')
    await wrapper.get('[data-testid="save"]').trigger('click')

    expect(wrapper.emitted('eventUpdate')).toBeUndefined()
    expect(wrapper.get('[role="alert"]').text()).toBe('Enter a valid start date and time.')
  })
})
