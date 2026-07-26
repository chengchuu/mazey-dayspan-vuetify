import { shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BasicExample from '../../examples/basic/App.vue'

const themeMocks = vi.hoisted(() => ({
  resolveThemePreference: vi.fn(() => ({ value:'dark', label:'Dark' })),
  setThemePreference: vi.fn(() => true),
}))

vi.mock('mazey', () => themeMocks)

const global = {
  stubs: {
    DsCalendar: true,
    VApp: {
      props: ['theme'],
      template: '<div data-testid="app" :data-theme="theme"><slot /></div>',
    },
    VMain: { template:'<main><slot /></main>' },
    VSwitch: {
      props: ['modelValue', 'label'],
      emits: ['update:modelValue'],
      template: '<button role="switch" :aria-checked="modelValue" @click="$emit(\'update:modelValue\', !modelValue)">{{ label }}</button>',
    },
  },
}

describe('basic example theme preference', () => {
  beforeEach(() => {
    themeMocks.resolveThemePreference.mockClear()
    themeMocks.setThemePreference.mockClear()
  })

  it('restores and persists the selected theme through Mazey', async () => {
    const wrapper = shallowMount(BasicExample, { global })

    expect(themeMocks.resolveThemePreference).toHaveBeenCalledWith('MAZEY_DAYSPAN_VUETIFY_THEME')
    expect(wrapper.get('[data-testid="app"]').attributes('data-theme')).toBe('dark')

    await wrapper.get('[role="switch"]').trigger('click')

    expect(themeMocks.setThemePreference).toHaveBeenCalledWith('MAZEY_DAYSPAN_VUETIFY_THEME', 'light')
    expect(wrapper.get('[data-testid="app"]').attributes('data-theme')).toBe('light')
  })
})
