# Original architecture assessment and migration inventory

This assessment was completed before the Vue 3 implementation. The source reviewed was the local
`dayspan-vuetify` 0.4.0 repository: package/build configuration, plugin and global component,
all 39 files under `src/components`, locale and style files, exports, demo application, README,
and documentation.

## What is worth preserving

- Calendar navigation and day/week/month/agenda presentations.
- A calendar event separated from its recurrence schedule and occurrence.
- Full-day and timed events, multi-day spans, current-day context, and overlap layout.
- Creation, editing, deletion, moving, inclusion, exclusion, cancellation, and recurrence preview.
- Fine-grained event rendering and editor slots.
- Runtime locales and component defaults.

## What is deliberately replaced

The Vue 2 plugin globally registered every component, created a hidden reactive Vue instance,
wrote `$dayspan`, `$dsDefaults`, and `$dsValidate` onto `Vue.prototype`, exposed `Vue.$dayspan`,
and patched Vue's private `_b` binding helper. The global component also mutated DaySpan's shared
pattern registry. These mechanisms are replaced by an app-scoped `provide`/`inject` context,
immutable configuration merging, named exports, and an optional standard Vue plugin.

The presentation used Vuetify 1 APIs including `v-layout`, `v-flex`, `v-list-tile`, legacy named
slot syntax, Material icon-font names, and `$vuetify.breakpoint`. Components also directly mutated
DaySpan class instances and passed mutable, ambiguous event envelopes containing `$vm`, `$element`,
and a `handled` switch. The new API uses plain typed data, Vuetify 3/public Vue APIs, CSS grid,
typed tuple emits, and explicit update payloads.

The old build was Webpack 2, Babel 6/stage-2, `node-sass`, and ExtractTextPlugin, producing one UMD
bundle. The new build is Vite library mode, native TypeScript, Sass, ESM, declarations, explicit
exports, and external Vue/Vuetify peers.

## Security, coupling, and quality findings

- User-controlled titles/descriptions and several locale/config labels were rendered with
  `v-html` in agenda, identifier, schedule, action, and forecast components. Rich content is now
  slot-only; plain content uses text interpolation. Explicit HTML requires the host sanitizer.
- CalendarApp, Calendar, event dialogs, gesture surfaces, and scheduling controls were tightly
  coupled through refs, instance mutation, globally shared prompts, and DaySpan/Vuetify classes.
- Locale application mutated one global configuration object and embedded functions among strings.
- No automated test suite was present. Documentation covered setup and some global configuration,
  but public events/slots, accessibility, security boundaries, and compatibility status were
  incomplete.
- Mouse gestures were the primary interaction model; semantic controls, focus management, and
  keyboard workflows were incomplete.

## Component migration inventory

| Original area | New API | Initial status | Decision |
| --- | --- | --- | --- |
| `DsCalendarApp`, `DsCalendar` | Same names | Implemented | Controlled view/date/events with typed events |
| `DsWeeksView`, `DsDaysView`, `DsDayTimes` | Same names | Implemented | Purpose-specific views; CSS-grid layout |
| `DsAgenda` | Same name | Implemented | Flattened public surface; `agenda-event` slot |
| `DsCalendarEvent*` | Internal event button + public slots | Implemented | No internal-structure components exported |
| `DsEventDialog`, `DsEvent` | Same names | Implemented | Controlled dialog and validated typed drafts |
| `DsSchedule` | Same name | Implemented | One typed editor for daily/weekly/monthly/yearly rules |
| inclusion/exclusion/cancel/move actions | scheduling core occurrence overrides | Implemented in core | UI remains intentionally compact |
| gesture component | Native pointer/keyboard interaction | Partial | Selection and keyboard work; drag/resize roadmap |
| global defaults/locales | plugin context + `useMazeyDaySpan` | Implemented | App-scoped and runtime extensible |

## Original event and slot findings

Useful original actions included add/added/adding, edit, save, remove, move/moving/moved,
view-day, change, show/hide/cancel, inclusion/exclusion/cancellation, and low-level mouse events.
The new public set normalizes these to `eventCreate`, `eventUpdate`, `eventRemove`, `eventMove`,
`eventClick`, `dayClick`, `viewChange`, and `rangeChange`; low-level DOM envelopes are not public.

Useful slots retained conceptually are toolbar, navigation controls, date title, event title/details,
empty state, agenda event, schedule sections, dialog actions, and rich event rendering. Slots tied to
old toolbar internals, list tiles, activators, and placeholder subcomponents are not preserved.

## Scheduling dependency decision

Approach B (internal core) is used. `dayspan` 0.12.2 is an old CommonJS-era JavaScript dependency
without first-party TypeScript declarations or a safe tree-shakable ESM surface; its mutable classes
and global pattern registry would leak through every component. Although MIT licensed and feature
rich, its maintenance/API shape and browser-bundle characteristics are unsuitable for the public
foundation. The internal core intentionally supports a bounded recurrence model and can later gain
an RFC 5545 adapter without changing component contracts.
