<!-- Author: Supreeth Kumar K (SKK) -->

# SKK Portfolio — Dark Theme

Personal portfolio site for **Supreeth Kumar K** — Technical Program Manager & Chief Architect (Autonomy, Robotics & AI Systems).

**Live:** https://supreethk6.github.io/skk-portfolio-dark-theme/

## Stack

Static HTML/CSS/JS, deployed via GitHub Pages.

- Bootstrap 5.0.2 (grid + utilities, CDN)
- Slick Carousel 1.8.1 (testimonials, CDN)
- Remixicon 2.5.0 (icons, CDN)
- Google Fonts — Poppins + DM Serif Display
- jQuery 3.5.1 (Slick dependency, CDN)

No build step at runtime — files in this repo are what's served.

## Repository layout

```
.
├── index.html                 # Homepage
├── projects/                  # Per-project detail pages
├── assets/
│   ├── css/main.css           # Site styles
│   ├── js/main.js             # Slider init
│   └── images/                # Photos, project thumbnails
├── tests/
│   └── e2e/                   # Playwright + axe accessibility tests
├── scripts/
│   └── humanize-commit.sh     # Commit wrapper enforcing no-AI-attribution
├── .github/
│   ├── workflows/ci.yml       # Lint + e2e + lighthouse on every PR
│   └── pull_request_template.md
├── .htmlvalidate.json         # HTML lint rules
├── .stylelintrc.json          # CSS lint rules
├── lychee.toml                # Broken-link checker config
├── playwright.config.js       # Multi-viewport E2E config
├── lighthouserc.json          # Perf / a11y / SEO budgets
└── package.json               # Dev dependencies + npm scripts
```

## Development

```bash
npm install
npx playwright install --with-deps chromium firefox webkit
npm run serve              # http://localhost:8080
```

## Quality gates

| Command | What it checks |
|---|---|
| `npm run lint:html`     | Semantic HTML, WCAG hints, attribute validation |
| `npm run lint:css`      | Stylelint with `stylelint-config-standard` |
| `npm run test:links`    | Broken internal + external links (lychee) |
| `npm run test:e2e`      | Playwright across desktop, mobile, tablet + axe a11y |
| `npm run test:lighthouse` | Perf / a11y / SEO / best-practices budgets |
| `npm test`              | Lint + E2E (the local default) |

CI runs all of the above on every pull request.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branching, commit, and PR conventions.
