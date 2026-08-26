# Mazey utility candidates

This review compared the project's shared date, recurrence, layout, input, component, and documentation helpers with the installed `mazey` API. The candidates below have distinct behavior, tests or repeated use, and a useful contract outside this Vue calendar package.

## 1. `expandRecurrence`

- **Purpose:** Expand a bounded daily, weekly, monthly, or yearly recurrence into occurrences while applying inclusions, exclusions, cancellations, moved occurrences, count/until limits, week starts, and an output limit.
- **Why it is reusable:** The recurrence work in `src/core/recurrence.ts` is framework-independent and already handles difficult calendar cases such as leap days, month-end clamping, sparse selectors, old unbounded series, and stable occurrence identity. Scheduling, reminders, booking, and reporting projects need the same behavior without depending on Vue or `CalendarEvent`.
- **Proposed generalized API:**

```ts
interface RecurrenceExpansionOptions {
  start: Date
  durationMs: number
  rule: RecurrenceRule
  range: { start: Date; end: Date }
  inclusions?: readonly Date[]
  exclusions?: readonly Date[]
  overrides?: readonly {
    originalStart: Date
    start?: Date
    end?: Date
    cancelled?: boolean
  }[]
  limit?: number
}

interface RecurrenceOccurrence {
  originalStart: Date
  start: Date
  end: Date
}

function expandRecurrence(
  options: RecurrenceExpansionOptions,
): RecurrenceOccurrence[]
```

Keep event metadata and IDs in a project adapter; the reusable function should only own recurrence dates, duration, overrides, ordering, and bounds.

## 2. `layoutOverlappingIntervals`

- **Purpose:** Assign columns and a column count to overlapping time intervals so they can be rendered side by side.
- **Why it is reusable:** `src/core/overlap.ts` contains a non-mutating interval-packing algorithm that is independent of calendar presentation. Timelines, resource planners, booking grids, and Gantt-like views can reuse it with their own item types.
- **Proposed generalized API:**

```ts
interface IntervalLayout<T> {
  item: T
  column: number
  columnCount: number
}

function layoutOverlappingIntervals<T>(
  items: readonly T[],
  accessors: {
    start: (item: T) => Date | number
    end: (item: T) => Date | number
  },
): IntervalLayout<T>[]
```

The generalized contract should document half-open intervals (`end <= nextStart` does not overlap), stable sorting, invalid-range handling, and whether `columnCount` represents the active group or the complete connected overlap cluster.

## 3. `parseLocalDateTime` and `formatLocalDateTime`

- **Purpose:** Strictly parse and format HTML `datetime-local` values using local calendar fields without applying a UTC conversion.
- **Why it is reusable:** Forms in many browser projects need a reliable wall-clock round trip. The current `fromLocalInput` validates impossible dates and times rather than allowing `Date` normalization, while `toLocalInput` emits the exact fixed-width form value. Mazey's `isValidDate` validates but does not return this strict local-field parse, and `formatDate` does not define the HTML control's fixed-width contract.
- **Proposed generalized API:**

```ts
type LocalDateTimePrecision = 'minute' | 'second' | 'millisecond'

function parseLocalDateTime(value: string): Date | null

function formatLocalDateTime(
  date: Date,
  options?: { precision?: LocalDateTimePrecision },
): string
```

Returning `null` makes parse failure explicit; a project needing the current invalid-`Date` sentinel can adapt it locally.

## 4. `addCalendarDays` and `startOfLocalWeek`

- **Purpose:** Perform non-mutating local-calendar day arithmetic and calculate a configurable local week boundary.
- **Why it is reusable:** `src/core/date.ts` correctly changes calendar fields instead of adding `86_400_000` milliseconds, which avoids daylight-saving-time drift. The same primitives are used by view ranges, recurrence alignment, navigation, and day intersection logic and are broadly useful in date-based applications.
- **Proposed generalized API:**

```ts
type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

function addCalendarDays(date: Date, amount: number): Date

function startOfLocalWeek(
  date: Date,
  options?: { weekStartsOn?: Weekday },
): Date
```

Both functions should reject invalid dates and invalid/non-integer arguments, preserve the input object, and define `startOfLocalWeek` as local midnight.

## 5. `validateMarkdownLocalLinks`

- **Purpose:** Find repository-local Markdown links, reject paths that escape the repository, verify targets, and validate heading fragments.
- **Why it is reusable:** `scripts/validate-doc-links.mjs` implements a useful documentation CI check that is not specific to this package. README-and-guides layouts recur across npm projects, including the need to distinguish handwritten Markdown from generated documentation.
- **Proposed generalized API:**

```ts
interface MarkdownLinkIssue {
  file: string
  target?: string
  code:
    | 'invalid-encoding'
    | 'outside-root'
    | 'missing-target'
    | 'missing-heading'
  message: string
}

function validateMarkdownLocalLinks(options: {
  rootDir: string
  files: readonly string[]
}): MarkdownLinkIssue[]
```

The reusable implementation should expose structured results rather than writing to the console or setting `process.exitCode`. CLI policy, generated-directory checks, and file discovery should remain separate adapters.

## Duplicated or overlapping code not recommended for Mazey

- `requestCreateWithKeyboard` is duplicated in the month and week views, but it is a small component-specific emission handler. A local component helper could remove the duplication; a broad keyboard-shortcut API would add more abstraction than value.
- Theme setup is repeated in the basic example and playground, but both already delegate storage semantics to Mazey's `resolveThemePreference` and `setThemePreference`. A Vue-only wrapper should stay in this project unless several Vue consumers establish the same lifecycle contract.
- `validInteger`, `uniqueSorted`, `sameInstant`, and simple string trimming are small native-language compositions. Extracting them would create low-value APIs.
- `validateEvent` combines generic date checks with package-specific ID, title, and error-code rules. Mazey's `isValidDate` can support callers, but the full validator should remain with the calendar domain.
