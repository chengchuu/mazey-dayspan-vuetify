import type { App, Plugin } from 'vue'
import { components } from '../components'
import { createMazeyDaySpanContext, mazeyDaySpanKey, type MazeyDaySpanOptions } from './context'
export const MazeyDaySpanVuetify: Plugin<[MazeyDaySpanOptions?]> = { install(app: App, options: MazeyDaySpanOptions = {}) {
  app.provide(mazeyDaySpanKey, createMazeyDaySpanContext(options))
  for (const component of components) app.component(component.name!, component)
} }
export default MazeyDaySpanVuetify
export * from './context'
