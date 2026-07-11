# mazey-dayspan-vuetify

A modern Vue 3 and Vuetify calendar and scheduling component library inspired by DaySpan Vuetify.
This is an independent successor and is not maintained or endorsed by the original author.

## Install

Requires Vue 3.5 and Vuetify 3.12.

```sh
npm install mazey-dayspan-vuetify vue vuetify
```

```ts
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import MazeyDaySpanVuetify from 'mazey-dayspan-vuetify'
import 'mazey-dayspan-vuetify/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(createVuetify({ components, directives }))
app.use(MazeyDaySpanVuetify, { locale: 'en', defaults: { eventColor: '#1976d2' } })
app.mount('#app')
```

The plugin registers the original `Ds` component names. Tree-shakable usage is also supported:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DsCalendar, type CalendarEvent } from 'mazey-dayspan-vuetify'
const events = ref<CalendarEvent[]>([{ id:'1', title:'Planning', start:new Date(), end:new Date(Date.now()+3600000) }])
</script>
<template><DsCalendar :events="events" view="month" /></template>
```

Original high-level component names are preserved for faster migration: `DsCalendarApp`,
`DsCalendar`, `DsWeeksView`, `DsDaysView`, `DsDayTimes`, `DsAgenda`, `DsEvent`,
`DsEventDialog`, and `DsSchedule`. Component contracts use Vue 3 conventions even though the
original names are retained.

## Simple migration from `dayspan-vuetify`

The original Vue 2 plugin accepted a Vue component definition and exposed the resulting instance as
`this.$dayspan` and `Vue.$dayspan`:

```js
import DaySpanVuetify from 'dayspan-vuetify'

Vue.use(DaySpanVuetify, {
  data: {
    // data overrides
  },
  computed: {
    // computed overrides
  },
  methods: {
    // method overrides
  },
})
```

In Vue 3, install the new package on the application and pass typed configuration instead:

```js
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import DaySpanVuetify from 'mazey-dayspan-vuetify'
import 'vuetify/styles'
import 'mazey-dayspan-vuetify/style.css'
import App from './App.vue'

const app = createApp(App)
const vuetify = createVuetify({ components, directives })

app.use(vuetify)
app.use(DaySpanVuetify, {
  locale: 'en',
  defaults: {
    eventColor: '#1976d2',
  },
})

app.mount('#app')
```

Replace `$dayspan` access with the composable inside Vue components:

```vue
<script setup>
import { useMazeyDaySpan } from 'mazey-dayspan-vuetify'

const dayspan = useMazeyDaySpan()
dayspan.setLocale('en')
</script>
```

Arbitrary `data`, `computed`, and `methods` overrides are no longer accepted. Keep application-specific
state in your own composables and use the library's typed options, slots, events, and composables as
extension points.

## Event and recurrence model

Events are plain typed data. Dates are `Date` objects and `end` is exclusive. Recurrence is bounded and
extensible rather than a leaked DaySpan class API.

```ts
const weekly: CalendarEvent = {
  id: 'review', title: 'Review', start: new Date(2026, 6, 6, 14), end: new Date(2026, 6, 6, 15),
  schedule: { recurrence: { frequency: 'weekly', interval: 1, byWeekday: [1], weekStart: 1, count: 12 },
    exclusions: [new Date(2026, 6, 20, 14)] }
}
```

Weekdays use JavaScript numbering (`0` Sunday through `6` Saturday). Weekly interval buckets begin
on `weekStart`, which defaults to Monday (`1`) and is independent of the active display locale.

## Localization and global defaults

English ships by default and `zh-CN` is included. Runtime registration and switching require no rebuild.

```ts
import { zhCN, useMazeyDaySpan } from 'mazey-dayspan-vuetify'
app.use(MazeyDaySpanVuetify, { locale:'zh-CN', locales:{ 'zh-CN':zhCN } })
const dayspan = useMazeyDaySpan()
dayspan.registerLocale('en-GB', { firstDayOfWeek:1, messages:{ today:'Today' } })
dayspan.setLocale('en-GB')
```

Defaults include `eventColor`, initial `view`, `agendaDays`, and `hourHeight`. CSS variables support light
and dark hosts; the library supplies no reset and assumes no icon font. Configure icons through Vuetify.

## Slots, events, and security

`toolbar`, `event`, `date-title`, `empty`, `agenda-event`, schedule extension, and dialog action slots are
documented in [docs/public-api.md](docs/public-api.md). Public emits use typed tuple payloads.

Titles, descriptions, locations, and locale messages render as text. The library never silently injects
event HTML. Use trusted Vue slot templates for rich content. A sanitizer can be provided in plugin options
for an application-defined explicit HTML extension, but no built-in component invokes it automatically.

## Accessibility and browser support

Calendar events, dates, navigation, and view controls are semantic buttons with labels and visible focus. Date controls support Shift+Enter and Shift+Space to request event creation without a pointer.
Dialogs use Vuetify's focus/escape behavior; reduced motion is honored. Roving grid focus, automated screen
reader coverage, and full keyboard drag/resize remain roadmap work. Targets are current evergreen browsers;
the 1.0 support matrix will be finalized after cross-browser CI.

## Playground and development

```sh
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run docs:build
```

The playground demonstrates all views, creation/editing, recurrence, runtime locale switching, dark mode,
and custom event rendering. Contributions should include typed public contracts, focused tests, updated docs,
and successful validation. See the [architecture assessment](docs/architecture-assessment.md),
[migration guide](docs/migration-from-dayspan-vuetify.md), and [roadmap](docs/roadmap.md).
