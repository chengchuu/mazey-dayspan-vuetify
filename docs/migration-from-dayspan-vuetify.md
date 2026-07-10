# Migration from `dayspan-vuetify`

This package is an independent successor, not a drop-in upgrade. Install Vue 3, Vuetify 3, and
`mazey-dayspan-vuetify`; import `mazey-dayspan-vuetify/style.css` after Vuetify styles.

| Old API | New API | Status | Notes |
| --- | --- | --- | --- |
| `dayspan-vuetify` | `mazey-dayspan-vuetify` | Replaced | New package and repository identity |
| `Vue.use(DaySpanVuetify)` | `app.use(MazeyDaySpanVuetify)` | Replaced | Vue 3 plugin API |
| `this.$dayspan`, `Vue.$dayspan` | `useMazeyDaySpan()` | Replaced | Typed app-scoped injection; no prototype mutation |
| `DsCalendarApp` | `MdCalendarApp` | Available | Controlled plain event arrays |
| `DsCalendar` | `MdCalendar` | Available | `view` is `month/week/day/agenda` |
| `DsWeeksView` | `MdMonthView` | Available | Six-week grid |
| `DsDaysView`, `DsDayTimes` | `MdWeekView`, `MdDayView` | Available | Typed events and overlap layout |
| `DsAgenda*` | `MdAgenda` | Available | One focused component |
| `DsEventDialog`, `DsEvent` | `MdEventDialog` | Available | `v-model` open state and plain event draft |
| `DsSchedule*` | `MdScheduleEditor` | Initial | Bounded typed rules; advanced UI planned |
| DaySpan class instances | `CalendarEvent`, `EventSchedule` | Replaced | Plain TypeScript data; internal core |
| `.sync`, `input` events | `v-model:*`, `update:*` | Replaced | Vue 3 conventions |
| mutable `handled` envelopes | explicit typed payloads | Replaced | Host owns state updates |
| global locale mutation | context `registerLocale` / `setLocale` | Replaced | Partial overrides and fallback |
| `dayspan-vuetify.min.css` | `mazey-dayspan-vuetify/style.css` | Replaced | Scoped tokens; no reset/icon font |
| internal activator/toolbar slots | semantic documented slots | Changed | See `docs/public-api.md` |
| drag, resize, touch gestures | pointer interaction | Planned | Not claimed as parity |

Vuetify 1 elements (`v-layout`, `v-flex`, `v-list-tile`), old slot attributes, icon-font names, and
`$vuetify.breakpoint` are not accepted. Register your preferred Vuetify 3 icon set in the host.

Locales now contain plain serializable strings and an explicit `firstDayOfWeek`. HTML-bearing locale
messages are unsupported. The initial core covers daily/weekly/monthly/yearly recurrence, inclusions,
exclusions, cancellation, and moved instances. Complex legacy pattern expressions and exhaustive
RFC 5545 interoperability remain unsupported.
