# Migration from `dayspan-vuetify`

`mazey-dayspan-vuetify` preserves the original high-level `Ds*` component names wherever a working
Vue 3 equivalent exists. This lets applications migrate imports and plugin setup incrementally rather
than renaming every template component at once.

This is still not a drop-in runtime upgrade: component contracts use Vue 3, plain typed event data,
and controlled state. Install Vue 3, Vuetify 3, and `mazey-dayspan-vuetify`; import
`mazey-dayspan-vuetify/style.css` after Vuetify styles.

## Preserved component names

| Original API | Vue 3 API | Status | Notes |
| --- | --- | --- | --- |
| `DsCalendarApp` | `DsCalendarApp` | Available | Controlled plain event arrays |
| `DsCalendar` | `DsCalendar` | Available | `view` is `month/week/day/agenda` |
| `DsWeeksView` | `DsWeeksView` | Available | Six-week month grid |
| `DsDaysView` | `DsDaysView` | Available | Timed week grid with overlap layout |
| `DsDayTimes` | `DsDayTimes` | Available | Single-day timed grid |
| `DsAgenda` | `DsAgenda` | Available | Focused agenda component |
| `DsEvent` | `DsEvent` | Available with changed contract | Uses the consolidated typed dialog/editor |
| `DsEventDialog` | `DsEventDialog` | Available | Controlled through `v-model` |
| `DsSchedule` | `DsSchedule` | Initial | Bounded daily/weekly/monthly/yearly rules |

Tree-shakable imports keep the original names:

```ts
import {
  DsCalendar,
} from 'mazey-dayspan-vuetify'
```

Installing the plugin globally registers the preserved `Ds*` names.

## Other API changes

| Old API | New API | Status | Notes |
| --- | --- | --- | --- |
| `dayspan-vuetify` | `mazey-dayspan-vuetify` | Replaced | New package and repository identity |
| `Vue.use(DaySpanVuetify)` | `app.use(MazeyDaySpanVuetify)` | Replaced | Vue 3 plugin API; the default import may still be locally named `DaySpanVuetify` |
| `this.$dayspan`, `Vue.$dayspan` | `useMazeyDaySpan()` | Replaced | Typed app-scoped injection; no prototype mutation |
| DaySpan class instances | `CalendarEvent`, `EventSchedule` | Replaced | Plain TypeScript data and internal core |
| `.sync`, `input` events | `v-model:*`, `update:*` | Replaced | Vue 3 conventions |
| mutable `handled` envelopes | Explicit typed payloads | Replaced | Host owns state updates |
| global locale mutation | Context `registerLocale` / `setLocale` | Replaced | Partial overrides and fallback |
| `dayspan-vuetify.min.css` | `mazey-dayspan-vuetify/style.css` | Replaced | Scoped tokens; no reset or icon font |
| internal activator/toolbar slots | Semantic documented slots | Changed | See the [public API guide](./public-api.md) |
| drag, resize, touch gestures | Pointer interaction | Planned | Not claimed as parity |

## Unsupported legacy component names

Legacy leaf components that only exposed the original implementation's internal structure are not
registered under misleading replacements. This currently includes `DsGestures`, `DsDay`, `DsDayRow`,
`DsDayPicker`, `DsAgendaDay`, `DsAgendaEvent`, the `DsCalendarEvent*` family, schedule subcontrols,
frequency subcontrols, `DsWeekHeader`, `DsWeekDayHeader`, and `DsIdentifierChip`.

Use the preserved high-level components and their documented slots instead. Additional legacy names
should only be restored when equivalent behavior and tests exist.

Vuetify 1 elements (`v-layout`, `v-flex`, `v-list-tile`), old slot attributes, icon-font names, and
`$vuetify.breakpoint` are not accepted. Register your preferred Vuetify 3 icon set in the host.

Locales now contain plain serializable strings and an explicit `firstDayOfWeek`. HTML-bearing locale
messages are unsupported. The initial core covers daily/weekly/monthly/yearly recurrence, inclusions,
exclusions, cancellation, and moved instances. Complex legacy pattern expressions and exhaustive
RFC 5545 interoperability remain unsupported. Weekly rules may set `weekStart` with JavaScript
weekday numbering; it defaults to Monday and is independent of locale `firstDayOfWeek`.
