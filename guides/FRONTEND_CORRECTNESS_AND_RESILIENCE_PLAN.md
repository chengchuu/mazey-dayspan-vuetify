# Frontend correctness and resilience plan

## Summary

Fix the confirmed frontend defects in recurrence handling, Vue components, theme styles, and the
playground with focused, maintainable changes. The existing lint, type-check, documentation-link,
and Vitest checks pass, but targeted source and browser inspection reproduced issues that current
tests do not cover.

## Goals

- Enforce recurrence output limits on the complete merged result.
- Apply plugin defaults consistently without overriding explicit component props.
- Render all-day events in week and day views with a dedicated all-day band.
- Correct slot scope and dialog-validity contracts.
- Preserve playground date navigation and expose one main landmark.
- Fix light-theme tokens when a light subtree is nested inside a dark theme.
- Add focused regression coverage for every confirmed behavior change.

## Non-goals

- Add direct Node.js or server-side rendering support. The current supported contract is a
  browser application built with Vite, and `BUG-010` documents the limitation.
- Implement drag and resize interactions, timezone abstraction, RFC 5545 support, or other roadmap
  features.
- Add compatibility aliases or shims for unreleased behavior.
- Change package exports, component names, props, emits, navbar links, or theme persistence.
- Refactor unrelated code or edit generated documentation output.
- Add broad `try...catch` blocks, redundant optional chaining, fallback objects, or guards around
  internal data already guaranteed by component contracts.

## Confirmed findings

1. A recurrence `limit` is applied before inclusions and moved overrides are merged, so the final
   result can exceed the requested maximum. Invalid limits are also handled inconsistently between
   recurring and nonrecurring events.
2. `defaults.view` is not honored, `defaults.agendaDays` does not consistently control agenda range
   and navigation, and the hourly grid remains hard-coded to a 48-pixel row height.
3. All-day events are omitted from week and day views. Month view exposes midnight as their
   accessible time instead of identifying them as all-day events.
4. Empty-state slot props are lost while passing through `MdCalendar` and `MdCalendarApp`, and the
   slot typing does not reflect that `day` is absent from the agenda empty state.
5. The event-dialog action slot reports `valid` from the displayed error list, so an untouched
   invalid draft can be reported as valid before the first save attempt.
6. A light-theme subtree inside a dark-themed ancestor inherits dark library variables because
   light tokens are only defined on `:root`.
7. The playground passes an inline `new Date(...)` value to the calendar. Changing views can
   recreate that value and reset a date selected through navigation.
8. The playground nests its own `<main>` inside Vuetify's `VMain`, producing two main landmarks.

## Implementation plan

### 1. Bound the final recurrence output

- Update `src/core/recurrence.ts` to validate `limit` before branching between recurring and
  nonrecurring events.
- Gather valid rule occurrences, inclusions, and moved overrides while preserving exclusions,
  cancellations, count behavior, and original-occurrence identity.
- Sort the complete result by effective start time, then apply `limit` to that final array.
- Keep the existing recurrence function signatures and return types unchanged.

### 2. Apply plugin defaults consistently

- Make `DsCalendar` use `ds.defaults.view` only when its `view` prop is omitted; an explicit prop
  continues to take precedence.
- Remove the independent `'month'` default from `DsCalendarApp` so its nested calendar can receive
  the plugin default.
- Use `ds.defaults.agendaDays` for agenda display, emitted ranges, and previous/next navigation.
  Use the existing calendar-day arithmetic helper so daylight-saving transitions do not change the
  intended number of days.
- Keep the standalone `useCalendar` signature unchanged instead of expanding the public API.
- Expose `ds.defaults.hourHeight` as a CSS custom property on the hourly track, and move the
  repeating grid background to that track so lines align with the configured row height.

### 3. Render and label all-day events

- Add a compact `.md-time-grid__all-day` band below each day heading and above the hourly track in
  `MdWeekView`.
- Reuse the existing event slot and `eventClick` behavior for entries in the all-day band.
- Show a multi-day all-day event in every intersected day, consistent with `eventsForDay`.
- Give all-day entries the accessible label `${title}, ${ds.t('allDay')}`.
- Apply the same all-day accessible label in month view rather than announcing midnight.
- Leave timed-event positioning and behavior in the hourly track unchanged.

### 4. Correct slot and dialog contracts

- Forward empty-state slot props through `MdCalendar` and `MdCalendarApp`.
- Type the empty-state `day` property as optional because month provides it while agenda does not.
- Compute the event-dialog action slot's `valid` value directly from the current parsed draft and
  `validateEvent` result.
- Continue showing validation messages only after a save attempt; do not couple the slot's validity
  value to whether messages are currently visible.

### 5. Fix theme inheritance and playground state

- Define light library tokens for `:root`, `.v-theme--light`, and `.md-theme-light`, while retaining
  the existing dark selectors. This lets an explicit light subtree override a dark ancestor.
- Store the playground calendar date in a stable `ref` and bind it with `v-model:date` so changing
  views does not recreate and reset the selected date.
- Replace the inner playground `<main>` with a non-landmark wrapper because Vuetify's `VMain`
  already supplies the page's main landmark.
- Preserve the navbar layout, mobile visibility rules, focus styles, adjacent theme control, and
  existing theme-storage behavior.

## Regression tests

### Unit tests

- Verify a final recurrence limit across a base occurrence plus an inclusion.
- Verify a final recurrence limit across a base occurrence plus a moved override.
- Verify invalid limits behave consistently for recurring and nonrecurring events.

### Component tests

- Verify the plugin default view is used when the prop is omitted and an explicit prop wins.
- Verify a custom `agendaDays` value controls the rendered range, emitted range, and navigation.
- Verify the configured hour height reaches the hourly track and grid styling.
- Verify all-day events render in week and day views with the event slot, click behavior, and
  accessible all-day label.
- Verify month view uses the all-day accessible label.
- Verify empty-state slot scope passes through both wrapper components, with and without `day`.
- Verify the dialog action slot starts invalid for an empty draft and updates after valid input.

### Browser tests

- Verify the rendered page contains exactly one main landmark.
- Navigate to the next month, switch to week view, and verify the selected month is preserved.
- Verify an explicit light subtree nested in a dark theme resolves the light library tokens.
- Retain the existing desktop and mobile navbar and theme-control assertions.

## Validation

Run the repository-native checks after implementation:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run docs
npm run docs:links
npm pack --dry-run
git diff --check
```

If the local Playwright browser is unavailable, report that limitation explicitly and use the
in-app browser to verify the targeted UI scenarios. Do not treat a skipped browser run as passing.

## Public interfaces and decisions

- Component names, props, emits, package exports, and recurrence function signatures remain
  unchanged.
- The empty-state slot type is corrected to make `day` optional, matching the documented runtime
  contract.
- Week and day views use the selected dedicated all-day band rather than mixing all-day events into
  the hourly track.
- Continue using Mazey's `parseLocalDateTime`, `formatLocalDateTime`, `isNumber`, and `isValidDate`
  helpers where their contracts match.
- Do not replace event ID generation with `genUniqueNumString`; it does not provide the uniqueness
  guarantee required for event identity. Keep `crypto.randomUUID()`.
- Modify maintained source and handwritten guides only; do not edit generated `docs/` output.
