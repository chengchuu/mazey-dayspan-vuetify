import { computed, inject, readonly, ref, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import { en, type MazeyLocale, type MazeyLocaleOverride } from '../locales'
import type { CalendarView } from '../types'

export interface MazeyDaySpanDefaults { eventColor: string; view: CalendarView; agendaDays: number; hourHeight: number }
export interface MazeyDaySpanOptions {
  locale?: string; fallbackLocale?: string; locales?: Record<string, MazeyLocaleOverride>
  defaults?: Partial<MazeyDaySpanDefaults>; sanitizer?: (html: string) => string
  hooks?: { beforeEventCreate?: (event: unknown) => boolean; beforeEventUpdate?: (event: unknown) => boolean }
}
export interface MazeyDaySpanContext {
  locale: Ref<string>; currentLocale: ComputedRef<MazeyLocale>; locales: Readonly<Ref<Readonly<Record<string, MazeyLocale>>>>
  defaults: Readonly<MazeyDaySpanDefaults>; configuration: Readonly<MazeyDaySpanOptions>
  setLocale(code: string): void; registerLocale(code: string, locale: MazeyLocaleOverride): void
  t(key: keyof MazeyLocale['messages']): string; formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string
  sanitizer?: (html: string) => string
}
export const mazeyDaySpanKey: InjectionKey<MazeyDaySpanContext> = Symbol('mazey-dayspan-vuetify')
const mergeLocale = (base: MazeyLocale, override: MazeyLocaleOverride, code: string): MazeyLocale => ({ ...base, ...override, code, messages: { ...base.messages, ...override.messages } })
export function createMazeyDaySpanContext(options: MazeyDaySpanOptions = {}): MazeyDaySpanContext {
  const fallback = options.fallbackLocale ?? 'en'; const locale = ref(options.locale ?? fallback)
  const initial: Record<string, MazeyLocale> = { en }
  for (const [code, value] of Object.entries(options.locales ?? {})) initial[code] = mergeLocale(en, value, code)
  const localeMap = ref<Readonly<Record<string, MazeyLocale>>>(initial)
  const currentLocale = computed(() => localeMap.value[locale.value] ?? localeMap.value[fallback] ?? en)
  const defaults = Object.freeze({ eventColor:'#1976d2', view:'month', agendaDays:30, hourHeight:48, ...options.defaults })
  return {
    locale, currentLocale, locales: readonly(localeMap), defaults, configuration: Object.freeze({ ...options }), sanitizer: options.sanitizer,
    setLocale(code) { if (!localeMap.value[code]) throw new Error(`Unknown mazey-dayspan-vuetify locale: ${code}`); locale.value = code },
    registerLocale(code, value) { localeMap.value = { ...localeMap.value, [code]: mergeLocale(localeMap.value[fallback] ?? en, value, code) } },
    t(key) { return currentLocale.value.messages[key] },
    formatDate(date, format = { dateStyle:'medium' }) { return new Intl.DateTimeFormat(currentLocale.value.code, format).format(date) }
  }
}
export function useMazeyDaySpan() { const context = inject(mazeyDaySpanKey); if (!context) throw new Error('Install MazeyDaySpanVuetify before calling useMazeyDaySpan().'); return context }
