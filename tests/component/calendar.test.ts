import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MdCalendar from '../../src/components/MdCalendar.vue'
import MdCalendarApp from '../../src/components/MdCalendarApp.vue'
import { dateKey } from '../../src/core/date'
import { createMazeyDaySpanContext, mazeyDaySpanKey } from '../../src/plugin/context'
import type { CalendarEvent, CalendarRange } from '../../src/types'

const events: CalendarEvent[] = [{
  id: 'safe',
  title: '<img src=x onerror=alert(1)>',
  description: '<script>alert(1)</script>',
  start: new Date(2026, 6, 10, 9),
  end: new Date(2026, 6, 10, 10),
}]
const global = { provide:{ [mazeyDaySpanKey as symbol]:createMazeyDaySpanContext() } }
const mountCalendar = () => mount(MdCalendar, {
  props: { events, modelValue:new Date(2026, 6, 10), view:'month' },
  global,
})

afterEach(() => vi.useRealTimers())

describe('MdCalendar', () => {
  it('renders event content as text and emits typed interaction events', async () => {
    const wrapper = mountCalendar()
    expect(wrapper.html()).toContain('&lt;img')
    expect(wrapper.find('img').exists()).toBe(false)
    await wrapper.find('.md-event').trigger('click')
    expect(wrapper.emitted('eventClick')).toHaveLength(1)
  })

  it('navigates and changes views accessibly', async () => {
    const wrapper = mountCalendar()
    await wrapper.get('[aria-label="Next"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    const week = wrapper.findAll('.md-toolbar__views button')[1]!
    await week.trigger('click')
    expect(wrapper.emitted('viewChange')?.[0]).toEqual(['week'])
  })

  it('emits the new visible range when returning to today', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 18, 12))
    const wrapper = mountCalendar()

    await wrapper.get('.md-toolbar__nav button:nth-child(2)').trigger('click')

    const range = wrapper.emitted('rangeChange')?.[0]?.[0] as CalendarRange
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(dateKey(range.start)).toBe('2026-11-01')
    expect(dateKey(range.end)).toBe('2026-12-13')
  })

  it('renders a custom event slot', () => {
    const wrapper = mount(MdCalendar, {
      props: { events, modelValue:new Date(2026, 6, 10), view:'month' },
      slots: { event:'<span class="custom">custom</span>' },
      global,
    })
    expect(wrapper.find('.custom').text()).toBe('custom')
  })

  it('preserves built-in agenda event and empty fallbacks when slots are omitted', async () => {
    const withEvent = mount(MdCalendar, { props:{ events, modelValue:new Date(2026, 6, 10), view:'agenda' }, global })
    expect(withEvent.get('.md-agenda__event').text()).toContain(events[0]!.title)

    const empty = mount(MdCalendar, { props:{ events:[], modelValue:new Date(2026, 6, 10), view:'agenda' }, global })
    expect(empty.get('.md-empty').text()).toBe('No events')
  })

  it('forwards calendar-app date navigation through update:date', async () => {
    const wrapper = mount(MdCalendarApp, { props:{ events, date:new Date(2026, 6, 10) }, global })
    await wrapper.get('[aria-label="Next"]').trigger('click')
    expect(dateKey(wrapper.emitted('update:date')?.[0]?.[0] as Date)).toBe('2026-08-01')
  })
})
