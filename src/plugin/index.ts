import type { App, Plugin } from 'vue'
import { componentEntries } from '../components/registry'
import { createMazeyDaySpanContext, mazeyDaySpanKey, type MazeyDaySpanOptions } from './context'
export const MazeyDaySpanVuetify: Plugin<[MazeyDaySpanOptions?]> = { install(app: App, options: MazeyDaySpanOptions = {}) {
  app.provide(mazeyDaySpanKey, createMazeyDaySpanContext(options))
  for (const [name, component] of componentEntries) app.component(name, component)
} }
export default MazeyDaySpanVuetify
export * from './context'
