# Bug report

Inspection scope: package/configuration, all files under `src/`, tests, examples, playground, styles, and documentation. Existing lint, typecheck, unit/component, build, and browser suites were run before fixes.

## BUG-001: Recurrence safety limit silently drops valid distant occurrences

Severity: High
Confidence: Confirmed
Area: Recurrence

### Summary

An unbounded recurring event that began more than 1,000 scan steps before the requested range returns no occurrences even when valid occurrences are inside the range.

### Affected files

- `src/core/recurrence.ts`

### Reproduction

1. Create a daily event beginning on January 1, 2020 without `count` or `until`.
2. Expand it for July 2026 with the default limit.
3. Observe an empty result because the loop spends all 1,000 iterations before reaching the range.

### Expected behavior

The bounded expansion returns occurrences in the requested range regardless of how old the series is.

### Actual behavior

The internal scan limit is applied before the requested range and silently truncates the series.

### Root cause

Expansion always scans forward from the event start and treats `limit` as a number of dates to inspect rather than a maximum number of returned occurrences.

### Proposed fix

Fast-forward rules toward the requested range while preserving count semantics, then bound emitted occurrences and reject invalid rule parameters.

### Regression test

Expand a 2020 daily series over a July 2026 range and assert that the requested dates are present.

## BUG-002: Moved occurrences are filtered using their original times

Severity: High
Confidence: Confirmed
Area: Recurrence

### Summary

A moved occurrence can render outside the requested calendar range, while an occurrence moved into the range from outside is omitted.

### Affected files

- `src/core/recurrence.ts`

### Reproduction

1. Move a July 10 occurrence to July 20.
2. Expand July 1–15.
3. Observe the July 20 occurrence in the result.
4. Conversely, move a June 30 occurrence into July 1–15 and observe that it is absent.

### Expected behavior

Range intersection uses the occurrence's effective overridden start and end while identity remains tied to `originalStart`.

### Actual behavior

The recurrence cursor and base duration are used for range filtering, and scanning stops before overrides whose original date is outside the range.

### Root cause

Overrides are applied only after the original occurrence passes range checks.

### Proposed fix

Generate effective occurrences before intersection checks and consider moved overrides separately when their original occurrence was not scanned into the range.

### Regression test

Assert both move-out and move-in behavior and verify the retained `originalStart` identity.

## BUG-003: Month and year recurrence overflows skip calendar periods

Severity: High
Confidence: Confirmed
Area: Recurrence

### Summary

Monthly recurrence from the 31st and yearly recurrence from February 29 use JavaScript date overflow, producing dates in the following month instead of a deterministic month-end policy.

### Affected files

- `src/core/recurrence.ts`

### Reproduction

1. Expand a monthly event beginning January 31, 2026.
2. Observe the next cursor overflow into March rather than handling February explicitly.
3. Expand a yearly February 29 event into a non-leap year and observe March 1.

### Expected behavior

Calendar recurrence has an explicit, documented policy for unavailable month days; this report proposes clamping to the final day of the target month.

### Actual behavior

Native `setMonth`/`setFullYear` overflow silently changes the target month.

### Root cause

The recurrence cursor is mutated while retaining a day that may not exist in the target month/year.

### Proposed fix

Construct the target period at day 1 and clamp the original day to its last valid day.

### Regression test

Cover January 31 monthly sequences and February 29 yearly sequences.

## BUG-004: Calendar slot forwarding suppresses built-in agenda and empty fallbacks

Severity: Medium
Confidence: Confirmed
Area: Vue

### Summary

`DsCalendar` and `DsCalendarApp` always provide forwarding slots, even when the consumer did not provide them. Vue therefore considers the slots present and suppresses the child components' built-in agenda row and “No events” content.

### Affected files

- `src/components/MdCalendar.vue`
- `src/components/MdCalendarApp.vue`

### Reproduction

1. Render `DsCalendar` in agenda view without custom slots.
2. With events, observe blank event buttons.
3. Without events, observe no “No events” fallback.

### Expected behavior

Built-in child content renders unless the corresponding public slot was supplied.

### Actual behavior

Unconditional forwarding templates create empty slots and replace the fallback.

### Root cause

Slot presence is not checked before defining the forwarding template.

### Proposed fix

Conditionally forward optional slots with `$slots` checks.

### Regression test

Mount calendar and calendar-app agenda views without slots and assert default event and empty content.

## BUG-005: Runtime recurrence inputs are not validated

Severity: Medium
Confidence: Confirmed
Area: Recurrence

### Summary

Rules received from JavaScript, JSON, or the schedule editor can contain `NaN`, zero, fractional values, invalid weekdays/months, or invalid dates. Expansion then returns misleading partial results or performs wasted scans instead of rejecting the rule.

### Affected files

- `src/core/recurrence.ts`
- `src/components/MdScheduleEditor.vue`

### Reproduction

1. Set the schedule editor interval field to an empty string; it emits `interval: 0`.
2. Pass `interval: NaN` to `expandEvent`.
3. Observe an invalid cursor after the first advance and inconsistent output rather than an explicit validation error.

### Expected behavior

Public inputs are validated at runtime and invalid recurrence rules cannot enter expansion.

### Actual behavior

TypeScript types are treated as runtime validation and `Math.max` does not protect against `NaN`.

### Root cause

There is no recurrence-rule validator or normalized update guard.

### Proposed fix

Add typed recurrence validation, make expansion fail safely, and prevent the editor from emitting invalid intervals.

### Regression test

Exercise non-finite/zero intervals and invalid list values through the core and editor.

## BUG-006: Calendar app does not synchronize navigated dates with its owner

Severity: Medium
Confidence: Confirmed
Area: Vue

### Summary

`DsCalendarApp` accepts a controlled `date` prop but does not declare or forward an `update:date` event, so navigation changes remain trapped in the nested calendar.

### Affected files

- `src/components/MdCalendarApp.vue`
- `guides/public-api.md`

### Reproduction

1. Bind `v-model:date` to `DsCalendarApp`.
2. Activate Next or Today.
3. Observe that the parent's date is unchanged.

### Expected behavior

A controlled date prop has a matching update event and can be synchronized with `v-model:date`.

### Actual behavior

Only the view update is forwarded.

### Root cause

The wrapper omits `update:date` from its emits and does not listen for the nested `update:modelValue` event.

### Proposed fix

Declare `update:date`, forward navigation updates, and document the event.

### Regression test

Mount the app, navigate, and assert one `update:date` payload with the new calendar date.

## BUG-007: Requested `Md*` named package imports are intentionally absent

Severity: Medium
Confidence: Confirmed
Area: Build

### Summary

The requested consumer check using `MdCalendar` and `MdAgenda` fails because the package exports only the documented legacy-compatible `Ds*` public names.

### Affected files

- `src/components/index.ts`
- `guides/public-api.md`
- `AGENTS.md`

### Reproduction

1. Pack the package.
2. In a clean consumer, import `{ MdCalendar, MdAgenda }` from `mazey-dayspan-vuetify`.
3. TypeScript reports that these exports do not exist.

### Expected behavior

The acceptance import surface and documented package policy agree.

### Actual behavior

The requested import names conflict with the repository rule that `Md*` implementation names must not be public.

### Root cause

The external validation request assumes a different public naming convention than the repository contract.

### Proposed fix

Keep `Md*` private per repository policy and validate/document the equivalent `{ DsCalendar, DsAgenda }` imports; change policy explicitly before adding aliases.

### Regression test

Compile a packed consumer with default plugin, `{ DsCalendar, DsAgenda }`, and the CSS export.

## BUG-008: Timezone model and DST duration policy are underspecified

Severity: Medium
Confidence: Highly likely
Area: Calendar

### Summary

The implementation uses local `Date` calendar arithmetic for recurrence starts but elapsed milliseconds for occurrence durations. Around DST, a recurring wall-clock event can therefore preserve elapsed duration while changing its displayed end time. The public docs do not state this policy.

### Affected files

- `src/core/recurrence.ts`
- `README.md`
- `guides/roadmap.md`

### Reproduction

1. In `America/New_York`, create an event whose base occurrence spans the spring-forward transition.
2. Repeat it daily into a normal day.
3. Compare wall-clock end times and elapsed duration.

### Expected behavior

The package explicitly defines whether recurrence preserves wall-clock fields or elapsed duration and tests that behavior in supported timezones.

### Actual behavior

Mixed calendar and elapsed-time arithmetic implies a policy that is neither documented nor comprehensively tested.

### Root cause

There is no timezone abstraction or declared DST duration contract.

### Proposed fix

Choose and document a model before changing behavior; add subprocess tests under representative `TZ` values.

### Regression test

Run spring-forward and fall-back recurrence fixtures under UTC, New York, London, Tokyo, and Sydney.

## BUG-009: Monthly and yearly selector rules never visit selected dates

Severity: High
Confidence: Confirmed
Area: Recurrence

### Summary

Monthly `byMonthDay` values differing from the base event day and yearly `byMonth` values differing from the base month produce no occurrences.

### Affected files

- `src/core/recurrence.ts`

### Reproduction

1. Start a monthly event on January 10 with `byMonthDay: [15]`.
2. Expand several months and observe no occurrences.
3. Start a yearly event in January with `byMonth: [2]` and observe the same failure.

### Expected behavior

The cursor visits and emits the selected calendar dates in active interval periods.

### Actual behavior

The cursor advances only on the base day/month, then filters that cursor against selectors it can never reach.

### Root cause

Selectors are implemented only as filters, without selector-aware candidate generation.

### Proposed fix

Scan calendar days for selector-bearing monthly/yearly rules while applying explicit month/year interval alignment.

### Regression test

Cover a monthly 15th rule and a yearly February 1 rule whose base event uses different fields.

## BUG-010: Direct Node ESM import fails on Vuetify component CSS

Severity: Medium
Confidence: Confirmed
Area: Build

### Summary

Importing the packed package directly in Node.js throws `ERR_UNKNOWN_FILE_EXTENSION` for a Vuetify component `.css` file. Bundler-based client consumption succeeds, but the package has no verified direct-Node/SSR entry behavior.

### Affected files

- `src/components/MdEventDialog.vue`
- `vite.config.ts`
- `package.json`

### Reproduction

1. Install the packed package with Vue and Vuetify in a clean consumer.
2. Run `node -e "import('mazey-dayspan-vuetify')"`.
3. Observe Node fail while resolving Vuetify component CSS.

### Expected behavior

The supported SSR contract is explicit, and any claimed Node-importable entry loads without a CSS extension error.

### Actual behavior

The ESM entry transitively imports Vuetify component modules whose CSS Node cannot load natively.

### Root cause

The single package entry eagerly exposes plugin/component registration and Vuetify-backed dialog code; there is no SSR-specific validation or documented bundler requirement.

### Proposed fix

Define the supported SSR environment, add a Vite SSR consumer test, and consider split component/plugin entry points only if direct Node import is a supported goal.

### Regression test

Build and execute a minimal Vite SSR consumer that imports the package entry and renders a non-dialog component.
