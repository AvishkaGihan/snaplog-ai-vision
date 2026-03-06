# Contributing to SnapLog AI Vision

Thank you for your interest in contributing! This guide covers how to set up your development environment, follow our coding standards, and submit changes.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Branching Strategy](#branching-strategy)
- [Commit Messages](#commit-messages)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Running Tests](#running-tests)

---

## Development Setup

Follow the setup instructions in [README.md](README.md). In summary:

```sh
nvm use          # Pins Node 20 via .nvmrc
npm install
cd functions && npm install && cd ..
```

Pre-commit hooks (Husky + lint-staged) are installed automatically via the `prepare` npm script when you run `npm install`.

---

## Code Style

### Formatting — Prettier

All code is auto-formatted by [Prettier](https://prettier.io/) on every commit via a pre-commit hook. The configuration lives in [`.prettierrc`](.prettierrc).

To format manually:

```sh
npx prettier --write "src/**/*.{ts,tsx}"
npx prettier --write "functions/src/**/*.ts"
```

### Linting — ESLint

We use TypeScript-strict ESLint rules. The Cloud Functions codebase additionally bans `any` types entirely.

To lint manually:

```sh
npm run lint              # Root (src/)
cd functions && npm run lint   # functions/src/
```

Lint errors block commits. Fix them before pushing.

### TypeScript

- Strict mode is enabled in both root and Cloud Functions (`"strict": true`).
- Use `null` (not `undefined`) for absent values.
- Use ISO 8601 strings for date values exchanged across system boundaries.
- Use `async/await` exclusively — no raw promise chains (`.then`/`.catch`).
- Do not use `any`. Prefer `unknown` when the type is truly unknown, then narrow it.

### Path Aliases

Use the `@/` alias for imports from `src/`:

```ts
// Good
import { useItemStore } from '@/stores/useItemStore';

// Avoid
import { useItemStore } from '../../stores/useItemStore';
```

---

## Branching Strategy

| Branch          | Purpose                               |
| --------------- | ------------------------------------- |
| `main`          | Protected. Always deployable.         |
| `feat/<topic>`  | New features                          |
| `fix/<topic>`   | Bug fixes                             |
| `chore/<topic>` | Tooling, deps, non-functional changes |
| `docs/<topic>`  | Documentation only                    |

Always branch from `main`:

```sh
git checkout main && git pull
git checkout -b feat/my-feature
```

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`

**Examples**:

```
feat(camera): add haptic feedback on capture
fix(sync): prevent duplicate draft uploads on reconnect
chore(deps): bump firebase to 12.9.0
docs(readme): add setup screenshots
```

---

## Submitting a Pull Request

1. Push your branch and open a PR against `main`.
2. Fill out the [PR template](.github/PULL_REQUEST_TEMPLATE.md) completely.
3. Ensure all CI checks pass (lint, typecheck, functions typecheck).
4. Request at least **one reviewer**.
5. Address all review comments before merging.
6. Use **Squash and Merge** to keep the history clean.

---

## Running Tests

Cloud Functions have unit tests covering the rate limiter middleware and retry utility:

```sh
cd functions
npm test
```

Tests are run automatically in CI on every push and pull request.
