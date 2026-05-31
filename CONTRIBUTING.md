<!-- Author: Supreeth Kumar K (SKK) -->

# Contributing

This is a personal portfolio site, but it follows a real SDLC so the git history reads like a production project.

## Branching

| Prefix | Use |
|---|---|
| `feat/NN-short-name` | New feature / section |
| `fix/NN-short-name` | Bug or hygiene fix |
| `chore/short-name` | Tooling, infra, dependencies |
| `docs/short-name` | Documentation only |

`master` is protected — merges require a green CI run and explicit approval.

## Local setup

```bash
npm install
npx playwright install --with-deps chromium firefox
npm run serve         # http://localhost:8080
npm test              # lint + e2e
```

## Quality gates (must pass before PR is ready for review)

| Gate | Command | Threshold |
|---|---|---|
| HTML validation | `npm run lint:html` | 0 errors |
| CSS lint | `npm run lint:css` | 0 errors |
| Broken links | `npm run test:links` | 0 broken |
| E2E + axe a11y | `npm run test:e2e` | All pass; 0 serious/critical violations |
| Lighthouse | `npm run test:lighthouse` | perf ≥ 85, a11y ≥ 90, SEO ≥ 90, best-practices ≥ 85 |

CI enforces the same gates on every PR.

## Commit messages

Use the `scripts/humanize-commit.sh` wrapper:

```bash
./scripts/humanize-commit.sh -m "feat(hero): reposition as TPM and Chief Architect"
```

The wrapper rejects commits that contain AI-assist attribution or Co-Authored-By footers. All commits are first-person, human-written.

Format: conventional-ish, short imperative subject (≤ 70 chars), optional body explaining *why*.

## Pull request review

Every PR must:
1. Pass all CI gates above.
2. Include before/after screenshots for any visible change.
3. Be approved by SKK before merge.
4. Be squash-merged into `master` (clean linear history).

After merge, the PR author verifies the live deploy at https://supreethk6.github.io/skk-portfolio-dark-theme/ before moving on.
