# AGENTS.md

This guide applies to the entire `mazey-dayspan-vuetify` repository.

## Project contract

`mazey-dayspan-vuetify` is an independent Vue 3.5 and Vuetify 3 calendar and scheduling component
library inspired by the original Vue 2 `dayspan-vuetify` project. It is not a line-by-line port and
does not depend on the legacy `dayspan` package.

Keep the package:

- TypeScript-first and strongly typed.
- ESM-only, tree-shakable, and suitable for Vite-based browser applications.
- Accessible, localized, safe by default, and friendly to host-application styles.
- Free of Vue private APIs, prototype mutation, global framework patches, and implicit HTML
  rendering.

Use pnpm for local dependency installation and lockfile updates, then run repository scripts with
npm. The current workflows run `npm install` and npm scripts on Node.js 22. The repository
intentionally tracks `pnpm-lock.yaml`, ignores `package-lock.json`, and has no `packageManager` or
`engines` field; preserve that state. When dependencies change, keep `package.json` and the tracked
pnpm lockfile synchronized without adding a package lock.

## Repository layout

- `src/core/`: framework-independent date, range, recurrence, validation, and overlap logic.
- `src/types/`: public event, occurrence, recurrence, range, and view types.
- `src/components/`: Vue SFC implementations. `Md*` filenames are internal; public components use
  `Ds*` names.
- `src/components/registry.ts`: explicit global component registration names.
- `src/composables/`: `useCalendar` and the re-exported plugin context API.
- `src/plugin/`: plugin installation, injection context, defaults, locale management, and
  formatting.
- `src/locales/`: locale types plus built-in English and `zh-CN` locales.
- `src/styles/main.scss`: library styles and `--md-*` design tokens.
- `examples/basic/`: source-import example covered by component tests.
- `playground/`: Vite-powered public website and interactive example.
- `tests/unit/`, `tests/component/`, and `tests/e2e/`: Vitest and Playwright coverage.
- `guides/`: handwritten project documentation, including `PUBLIC_API.md`, migration, roadmap,
  audit, implementation-plan, and notice files.
- `eslint.config.js`: ESLint 9 flat configuration for JavaScript, TypeScript, Vue, and ESLint
  Stylistic rules. `tests/unit/eslintConfig.test.ts` covers long-import formatting and trailing
  whitespace.
- `scripts/validate-doc-links.mjs`: validates local links in `README.md` and `guides/` and rejects
  Markdown source under generated `docs/`.
- `dist/` and `docs/`: generated package and GitHub Pages output. Never edit or commit them by hand.

## Package and dependency boundaries

`src/index.ts` is the package entry. It imports the library stylesheet and exposes the default
plugin, named plugin/context APIs, `Ds*` components, composables, core helpers, locales, and public
types through a flat root API.

The supported public component names are:

- `DsAgenda`
- `DsCalendar`
- `DsCalendarApp`
- `DsDayTimes`
- `DsDaysView`
- `DsEvent`
- `DsEventDialog`
- `DsSchedule`
- `DsWeeksView`

Do not export internal `Md*` names. When adding a public component, export its `Ds*` name from
`src/components/index.ts`, add the exact name to `src/components/registry.ts`, add focused tests,
and document its props, emits, and slots in `guides/PUBLIC_API.md` and the README where relevant.

Vue and Vuetify are peer dependencies. Mazey is a runtime dependency used for strict local
date-time conversion, general date/number validation, and stored theme preferences in the example
and playground. Keep all three external in the Vite library build. Before adding a general-purpose
helper covered by Mazey, verify the installed version's declarations, implementation, runtime
compatibility, and edge cases. Use named imports only when behavior matches; do not add wrappers
that merely rename Mazey functions.

The package must continue to emit:

- `dist/index.js`
- `dist/index.d.ts`
- `dist/index.js.map`
- `dist/style.css`

The package allowlist contains `dist`, `README.md`, `LICENSE`, and `guides/NOTICE.md`. Preserve the
root exports for `.` and `./style.css`. The package entry is designed for bundler-based browser
consumption; do not claim verified direct Node.js or SSR entry support while `guides/BUG_REPORT.md`
still documents the Vuetify CSS import limitation.

## Architecture and public API rules

Keep `src/core/` independent of Vue and Vuetify. Core modules may depend on public types and
verified universal Mazey utilities, but must not import components, composables, or injection
context.

Use `<script setup lang="ts">`, the Composition API, typed props, tuple emits, and typed slots.
Use `mazeyDaySpanKey`, `createMazeyDaySpanContext()`, and `useMazeyDaySpan()` for shared context. Do
not rely on runtime SFC name inference for plugin registration.

Plugin defaults are `eventColor`, `view`, `agendaDays`, and `hourHeight`. `DsCalendar` uses the
configured default view only when its `view` prop is omitted. Agenda rendering, emitted ranges, and
navigation use `agendaDays`; time-grid positioning and hour lines use `hourHeight`. Keep explicit
component props authoritative over defaults.

Treat exports from `src/index.ts`, `src/components/index.ts`, `src/composables/`, `src/core/`,
`src/locales/`, `src/plugin/`, and `src/types/` as public API. When changing them, update tests,
`README.md`, `guides/PUBLIC_API.md`, and `guides/MIGRATION_FROM_DAYSPAN_VUETIFY.md` as applicable.
Preserve the current package version unless the task explicitly includes release or version work.

## Scheduling and date behavior

Use `Date` until an explicit timezone abstraction is introduced. Parse and format HTML
`datetime-local` values with Mazey's `parseLocalDateTime` and `formatLocalDateTime` so local
wall-clock fields are preserved. Adapt a `null` parse result to the calendar validation model; do
not use implementation-dependent parsing of timezone-less strings.

Iterate dates with calendar arithmetic rather than fixed 24-hour millisecond additions. UTC day
indexes are acceptable only for comparing local calendar-day distances.

Recurrence expansion must remain deterministic and bounded:

- `count` applies to matching rule-generated occurrences, not scanned dates or returned results.
- `limit` bounds returned occurrences independently from recurrence `count`.
- `weekStart` controls recurrence buckets independently from the display locale.
- Inclusions, exclusions, cancellations, and moved overrides must not mutate the source event.
- Moved occurrences retain their `originalStart` identity and are filtered by effective time.

Apply `limit` after rule occurrences, inclusions, and moved overrides are merged and sorted so it
bounds the final result. Event `end` values are exclusive. Week and day views render all-day events
in a dedicated band above the timed track; a multi-day all-day event appears in each intersected
day. Keep all-day events out of overlap layout and label them as all-day instead of announcing a
midnight time.

For recurrence changes, cover multiple weekdays, intervals greater than one, Monday and Sunday
week starts, `count` and `until`, month-end and leap-day behavior, sparse selectors, distant ranges,
and affected inclusion/exclusion/override interactions. Do not claim complete RFC 5545 or timezone
support.

## Localization, security, and accessibility

Do not hard-code component-facing text. Add message keys to `MazeyLocale`, provide English and
`zh-CN` values, and test runtime overrides. Display ranges use the active locale's
`firstDayOfWeek`; recurrence behavior uses `RecurrenceRule.weekStart`.

Render event fields and locale messages as plain text. Do not add `v-html` for user-controlled
content. Rich rendering belongs in typed Vue slots. Although plugin options expose a sanitizer, no
built-in component invokes it automatically.

Preserve native buttons, headings, lists, grids, fieldsets, labels, and dialog behavior. All
interactions must remain keyboard reachable with visible focus and accurate accessible names.
Maintain Shift+Enter and Shift+Space event-creation shortcuts, Vuetify dialog focus/Escape behavior,
and `prefers-reduced-motion` support. Do not require a Material icon font.

The calendar `empty` slot receives `day` in month view and no `day` in agenda view; keep the scope
typed as optional through `DsCalendar` and `DsCalendarApp`. The dialog `actions` slot receives the
validity of the current parsed draft even before validation messages are displayed.

Keep library styling in `src/styles/main.scss`. Use `--md-*` variables, support light and dark host
themes, and avoid global resets or selectors that alter unrelated host content. Define light tokens
for `:root`, `.v-theme--light`, and `.md-theme-light` so an explicit light subtree can override a
dark ancestor; preserve `.v-theme--dark` and `.md-theme-dark`. The documented consumer stylesheet
remains:

```ts
import 'mazey-dayspan-vuetify/style.css'
```

## Tests and local validation

Add regression coverage at the narrowest useful level:

- Date, recurrence, validation, and overlap logic: unit tests.
- Props, emits, slots, localization, accessibility, examples, and dialogs: component tests.
- Multi-step playground workflows, theme persistence, and mobile behavior: Playwright tests.

Tests must assert behavior and remain independent of network access, production credentials, the
current clock, local timezone, system theme, and persistent browser state. Use fixed local `Date`
constructors or fake timers and restore modified globals and timers.

Vitest runs before `dist/` exists. Keep its exact aliases for the package root to `src/index.ts` and
`mazey-dayspan-vuetify/style.css` to `src/styles/main.scss`; a broad package alias incorrectly
captures the stylesheet subpath. Mobile-only Playwright tests must check
`testInfo.project.name === 'mobile'`.

`eslint.config.js` registers `@stylistic/eslint-plugin` and treats formatting violations as errors.
Preserve double quotes, semicolons, two-space indentation, multiline trailing commas and imports,
spaced object braces, compact array brackets, final newlines, spaced comments, and no trailing
whitespace. Use `npm run lint:fix` for repository formatting; keep the focused ESLint configuration
test when changing rule order or fixer behavior.

Use the standard validation sequence for source changes:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

For playground, interaction, or documentation changes, also run:

```sh
npm run test:e2e
npm run docs
npm run docs:links
```

If Playwright browsers are unavailable, report the limitation. For package exports, build output,
allowlist, dependency, or release changes, run `npm pack --dry-run` or pack to a temporary directory
and verify a clean Vite consumer can import the default plugin, `DsCalendar`, `DsAgenda`, and
`mazey-dayspan-vuetify/style.css`.

## Playground, documentation, and deployment

The public website source is under `playground/`. `npm run dev` and `npm run docs:dev` serve it;
`npm run docs` runs the Markdown link validator and writes the generated Pages artifact to
`docs/`. Preserve `base: './'` so assets work below `/mazey-dayspan-vuetify/`.

Keep the page semantic, responsive, keyboard accessible, and crawlable with one descriptive `h1`.
Preserve the single main landmark, `Playground`/`GitHub`/`npm` navbar, locale control, header-level
`Dark mode` switch, stored theme preference, controlled calendar date, recurrence editor, custom
event rendering, favicon, and public sections. Keep the canonical URL, Open Graph and Twitter
metadata, JSON-LD, `robots.txt`, and `sitemap.xml` aligned with
`https://chengchuu.github.io/mazey-dayspan-vuetify/`. After a site change, inspect generated
`docs/index.html` for relative assets and the expected metadata, and confirm the crawler files were
copied. Do not edit generated `docs/` output.

GitHub Actions intentionally use npm without setup-node dependency caching because no npm lockfile
exists:

- `publish-npm.yml` validates pull requests to `main` and `release/v*`. Pushes to `release/v*`
  validate, build, and publish the package to npm and GitHub Packages. Manual dispatch validates
  only.
- `pages.yml` builds and deploys `docs/` on pushes to `main` and `release/v*`, and on manual
  dispatch. The `github-pages` environment must allow the deployment branch.

Do not publish, deploy, tag, push, or modify environment protection rules unless the user explicitly
requests it.

## Change discipline

Inspect `git status`, staged changes, unstaged changes, and untracked files before editing. Preserve
unrelated user work. Do not edit generated output, change package identity, bump versions, add
dependencies, or broaden workflow triggers outside the requested scope.

Before handoff, review the complete diff, run proportionate repository-native checks, run
`git diff --check`, and report modified files, behavior or API impact, exact validation results, and
all skipped checks or warnings. Do not stage or commit unless explicitly asked.
