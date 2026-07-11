# AGENTS.md

This file applies to the entire `mazey-dayspan-vuetify` repository.

## Project overview

`mazey-dayspan-vuetify` is an independent Vue 3 and Vuetify 3 calendar and scheduling component library. It is inspired by the original Vue 2 `dayspan-vuetify` project but is not a line-by-line port and does not use the legacy `dayspan` package.

The package must remain:

- TypeScript-first and strongly typed.
- Compatible with Vue 3.5 and Vuetify 3.
- ESM-only, tree-shakable, and suitable for Vite library mode.
- Safe by default, accessible, localized, and host-application friendly.
- Free of Vue private APIs, prototype mutation, and global framework patches.

Use npm. The supported runtime is Node.js 22.12 or newer, as declared in `package.json`.

## Repository layout

- `src/core/`: framework-independent scheduling, recurrence, date, range, and overlap logic.
- `src/types/`: public domain and emitted-event types.
- `src/components/`: Vue presentation components. Public component APIs retain the original `Ds` names. Implementation filenames are internal and do not define the package API.
- `src/composables/`: reusable Vue state and behavior.
- `src/plugin/`: plugin installation, injection context, defaults, and locale registration.
- `src/locales/`: typed locale definitions and built-in translations.
- `src/styles/`: library styles and CSS design tokens.
- `src/utils/`: focused implementation helpers.
- `tests/unit/`: pure logic and utility tests.
- `tests/component/`: Vue Test Utils behavior and accessibility tests.
- `tests/e2e/`: Playwright user workflows.
- `playground/`: Vite demonstration and documentation application.
- `docs/`: architecture, public API, migration, and roadmap documentation.

Do not edit generated output under `dist/`, `playground/dist/`, Playwright reports, or coverage directories.

## Architecture rules

Keep domain logic independent from Vue and Vuetify. Modules under `src/core/` must operate on public typed data and must not import Vue components, composables, or injected context.

Vue components should use `<script setup lang="ts">`, Composition API, typed props, typed tuple emits, and typed slots. Avoid the Options API unless interoperability requires it and the reason is documented.

Use `provide`/`inject` through `mazeyDaySpanKey` and `useMazeyDaySpan()`. Do not add properties to Vue prototypes or mutate framework internals.

Vue and Vuetify are peer dependencies and must remain external to the library bundle. Avoid adding runtime dependencies when a small, well-tested internal implementation is sufficient.

## Public API changes

Treat exports from `src/index.ts`, `src/components/index.ts`, `src/types/`, `src/locales/`, and `src/plugin/` as public API.

When adding a public component:

1. Preserve the original `Ds` name when replacing a legacy component; choose an explicit `Ds` name for new public components.
2. Export it from `src/components/index.ts`.
3. Add its explicit name and component to `src/components/registry.ts` for plugin registration.
4. Add focused component tests.
5. Document public props, emits, and slots in `docs/public-api.md` and README examples where relevant.

Do not rely on SFC runtime `component.name` inference for global registration.

Do not remove or rename a supported `Ds` export. Do not expose implementation-only `Md` names from the package entry point or global plugin.

When changing public types, plugin options, events, slots, locale keys, package exports, or CSS entry points, update the README and migration documentation. Preserve the current package version unless the task explicitly includes release or versioning work; do not independently alter it as part of an unrelated change.

## Scheduling and date rules

Use `Date` consistently until an explicit timezone abstraction is introduced. Preserve local wall-clock values for `datetime-local` inputs by parsing numeric components; do not rely on implementation-dependent parsing of date strings without timezone offsets.

Date iteration must use calendar arithmetic rather than adding fixed 24-hour millisecond durations, so daylight-saving transitions do not skip or duplicate local dates. UTC day indexes may be used only for comparing calendar-day distances.

Recurrence expansion must remain deterministic and bounded. `count` applies to rule-generated matching occurrences. Exclusions and cancellations must not mutate the source event. Moved occurrences must preserve their original occurrence identity.

For weekly recurrence changes, test:

- Multiple selected weekdays.
- `interval` values greater than one.
- Monday- and Sunday-based `weekStart` boundaries.
- `count` and `until` boundaries.
- Inclusion, exclusion, cancellation, and movement interactions where affected.

Do not claim complete RFC 5545 or timezone support unless those behaviors are implemented and tested.

## Localization

Do not hard-code user-facing component text. Add strings to `MazeyLocale['messages']` and provide both English and `zh-CN` translations.

Runtime locales may be partial and inherit from the configured fallback locale. Validation error codes should be typed and should map to distinct locale message keys.

Use locale `firstDayOfWeek` for calendar presentation ranges. Keep recurrence semantics independent of the active UI locale unless the public recurrence model explicitly exposes that choice.

## Security and accessibility

Render event titles, descriptions, locations, and locale messages as plain text. Do not introduce `v-html` for user-controlled content. Rich content belongs in documented Vue slots; an explicit sanitizer is required for any future HTML-rendering API.

Preserve native semantic roles. Do not replace a button's role with a structural role such as `listitem`; wrap the button in the structural element instead.

All interactive behavior must be keyboard reachable, have visible focus, and expose accurate accessible names. Day and week variants must announce the correct view. Vuetify dialogs should preserve focus trapping and Escape-key behavior.

Respect `prefers-reduced-motion` and avoid requiring a Material icon font.

## Styling

Keep library styles in `src/styles/main.scss`. Use the existing `--md-*` CSS variables and support light and dark hosts. Do not introduce a global reset or selectors that unexpectedly alter the host application.

Component-specific styles should be scoped where practical. The documented consumer stylesheet remains:

```ts
import 'mazey-dayspan-vuetify/style.css'
```

## Tests

Every correctness fix or public behavior change requires a regression test at the narrowest useful level:

- Pure date, recurrence, validation, and overlap behavior: unit test.
- Props, emits, slots, localization, and accessibility: component test.
- Multi-step user workflows and mobile behavior: Playwright test.

Tests must assert behavior, not merely component existence. Use fixed local `Date` constructors or fake timers where current time matters. Restore fake timers after each test.

Mobile-only Playwright tests should check `testInfo.project.name === 'mobile'`; do not assume a custom `isMobile` fixture exists.

The standard validation sequence is:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

For interaction, documentation, or playground changes, also run:

```sh
npm run test:e2e
npm run docs:build
```

If Playwright browsers are unavailable, report that limitation instead of claiming the E2E suite passed.

## Documentation and packaging

Keep package identity as `mazey-dayspan-vuetify` in metadata, examples, exports, and documentation. State that the project is an independent successor and preserve MIT attribution in `NOTICE.md`.

The package must continue to emit:

- `dist/index.js`
- `dist/index.d.ts`
- `dist/index.js.map`
- `dist/style.css`

Do not bundle Vue or Vuetify. Verify packaging with `npm pack --pack-destination /tmp` when changing exports, build output, files allowlists, or release metadata.

The documentation site is currently the Vite application under `playground/`. Preserve its favicon, locale demonstration, dark-mode example, recurrence editor, and custom event rendering when changing the page shell.

## Change discipline

Preserve unrelated user changes and existing repository configuration. Use focused modules and avoid duplicating scheduling logic across components. Do not add placeholder components or tests merely to suggest feature coverage.

Before handing off a change, report the commands actually run and any failures, skips, warnings, or known limitations honestly.
