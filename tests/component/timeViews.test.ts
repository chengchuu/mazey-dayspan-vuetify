import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MdDayView from '../../src/components/MdDayView.vue'
import MdMonthView from '../../src/components/MdMonthView.vue'
import MdWeekView from '../../src/components/MdWeekView.vue'
import { createMazeyDaySpanContext, mazeyDaySpanKey } from '../../src/plugin/context'
import type { CalendarEvent } from '../../src/types'

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

  it('requests month-view event creation with Shift+Enter', async () => {
    const wrapper = mount(MdMonthView, { props, global })
    const dateButton = wrapper.get('.md-month__date')

    await dateButton.trigger('keydown', { key:'Enter', shiftKey:true })

    expect(dateButton.attributes('aria-keyshortcuts')).toBe('Shift+Enter Shift+Space')
    expect(wrapper.emitted('eventCreateRequest')).toHaveLength(1)
  })

  it('requests week-view event creation with Shift+Space', async () => {
    const wrapper = mount(MdWeekView, { props, global })
    const dayHeading = wrapper.get('.md-time-grid__heading')

    await dayHeading.trigger('keydown', { key:' ', shiftKey:true })

    expect(dayHeading.attributes('aria-keyshortcuts')).toBe('Shift+Enter Shift+Space')
    expect(wrapper.emitted('eventCreateRequest')).toHaveLength(1)
  })

  it('clamps cross-midnight timed events to the current day column', () => {
    const events:CalendarEvent[] = [{
      id: 'overnight',
      title: 'Overnight event',
      start: new Date(2026, 6, 9, 22),
      end: new Date(2026, 6, 10, 2),
    }]
    const wrapper = mount(MdWeekView, {
      props: { date:new Date(2026, 6, 10), events },
      global,
    })
    const currentDay = wrapper.findAll('.md-time-grid__day')[5]

    expect(currentDay).toBeDefined()
    expect(currentDay!.get('.md-time-event').attributes('style')).toContain('top: 0px')
    expect(currentDay!.get('.md-time-event').attributes('style')).toContain('height: 96px')
  })
})
