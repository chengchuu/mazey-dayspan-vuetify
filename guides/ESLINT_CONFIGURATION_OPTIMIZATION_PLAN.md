# ESLint configuration optimization plan

## Summary

Adopt the conventions from `ESLINT_RULES.md` using ESLint Stylistic, normalize the existing
codebase, and enforce a clean baseline in CI. Use the current stable `@stylistic/eslint-plugin`
5.10 release, whose ESM flat-config integration supports the project's ESLint 9 setup. See the
[ESLint Stylistic migration guide](https://eslint.style/guide/migration) and
[`@stylistic/eslint-plugin` package](https://www.npmjs.com/package/%40stylistic/eslint-plugin).

## Implementation changes

- Add `@stylistic/eslint-plugin` as a development dependency with range `^5.10.0`. Synchronize
  `package.json` and `pnpm-lock.yaml` without creating `package-lock.json`.
- Reformat `eslint.config.js` for readability, register the `@stylistic` plugin globally, and
  preserve all existing recommended, Vue, TypeScript, ignore, global, and project-specific rules.
- Configure these explicit error-level rules instead of enabling a broad preset:
  - Require semicolons.
  - Require double quotes.
  - Use two-space indentation and indent `switch` cases by one level.
  - Require trailing commas in multiline structures.
  - Require a final newline and spaces after comment markers.
  - Require spaces inside object braces.
  - Disallow spaces inside array brackets to remain compatible with Prettier.
  - Require imports to be multiline when they are already multiline or contain at least four
    members.
- Run `npm run lint:fix` once to normalize the currently affected JavaScript, TypeScript, and Vue
  files. Review the resulting changes as formatting-only and exclude generated output.
- Leave `.prettierrc` unchanged because its explicit semicolon setting and Prettier defaults match
  the selected quote, indentation, object-spacing, trailing-comma, and compact-array conventions.

## Validation

- Run `npm run lint:fix` a second time and confirm that it produces no further changes.
- Run `npm run lint` and require zero warnings and errors.
- Inspect the effective ESLint configuration for representative `.ts`, `.vue`, and `.mjs` files
  and confirm that all nine Stylistic rules are active at error severity.
- Run the repository checks:

  ```sh
  npm run typecheck
  npm test
  npm run build
  npm run test:e2e
  npm run docs
  npm pack --dry-run
  git diff --check
  ```

- Confirm that no generated `docs/` or `dist/` files are tracked and no `package-lock.json` was
  created.

## Interfaces and assumptions

- Do not change library exports, runtime behavior, Vue component contracts, or public types.
- Treat ESLint as the authoritative repository formatter. Do not add a Prettier dependency or
  formatting script.
- Normalize existing source immediately so style regressions fail CI instead of accumulating as
  warnings.
- Preserve unrelated working-tree changes. Do not stage, commit, publish, or deploy.
