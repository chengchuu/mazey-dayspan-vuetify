import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MdDayView from '../../src/components/MdDayView.vue'
import MdWeekView from '../../src/components/MdWeekView.vue'
import { createMazeyDaySpanContext, mazeyDaySpanKey } from '../../src/plugin/context'

const global = {
  provide: {
    [mazeyDaySpanKey as symbol]: createMazeyDaySpanContext(),
  },
}
const props = {
  date: new Date(2026, 6, 10),
  events: [],
}

describe('time view accessibility', () => {
  it('labels the day grid as a day', () => {
    const wrapper = mount(MdDayView, { props, global })

    expect(wrapper.get('[role="grid"]').attributes('aria-label')).toBe('Day')
  })

  it('labels the week grid as a week', () => {
    const wrapper = mount(MdWeekView, { props, global })

    expect(wrapper.get('[role="grid"]').attributes('aria-label')).toBe('Week')
  })
})
