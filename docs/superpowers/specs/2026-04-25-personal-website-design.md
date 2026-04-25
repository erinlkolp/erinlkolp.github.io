# Personal Website Design — erinlkolp

**Date:** 2026-04-25
**Owner:** Erin Kolp
**Domain:** becausefuckyouthatswhy.org
**GitHub user:** erinlkolp

## Goals

A personal showcase site that doubles as a dev brand. Surfaces a curated set of GitHub projects, an about page, and a blog. Static, low-maintenance, and visually distinctive — terminal/dev aesthetic.

## Non-Goals

- Email contact form (intentionally omitted to avoid spam/scraper exposure)
- Public email address surfaced on the site
- Comments on blog posts
- Search, tag pages, or RSS for the first cut (deferred — YAGNI)
- E2E or visual regression testing
- Server-side rendering or runtime API calls

## Stack

- **Astro** — static site framework with MDX integration for the blog
- **TypeScript** — for project config and GitHub data types
- **Tailwind CSS** — for the terminal-themed styling
- **GitHub Actions** — for build, deploy, and scheduled refresh
- **GitHub Pages** — hosting, served at `becausefuckyouthatswhy.org` via a `CNAME` file

## Repo Layout

The site lives in a single repo (recommended: `erinlkolp/erinlkolp.github.io` since that's the canonical Pages convention).

```
src/
  components/      → Layout, Nav, Footer, ProjectCard, BlogPostCard, PromptLine
  layouts/         → BaseLayout.astro, BlogPostLayout.astro
  pages/
    index.astro    → home (intro + featured projects + recent posts)
    projects.astro → full projects list
    about.astro    → about page
    404.astro      → not-found page
    blog/
      index.astro  → blog listing
      [slug].astro → individual blog post
  content/
    blog/          → .md/.mdx posts via Astro Content Collections
  data/
    projects.ts    → curated repo list + manual blurbs
  lib/
    github.ts      → GitHub API client, build-time only
  styles/
    global.css     → Tailwind + theme tokens
public/
  CNAME            → becausefuckyouthatswhy.org
  favicon.svg
.github/workflows/
  deploy.yml       → build + deploy on push and on schedule
```

## Pages

- **`/`** — hero with prompt-styled intro (`$ whoami` → short bio), Featured Projects (top ~3 from `projects.ts`), Recent Posts (latest 2-3 blog entries), links to `/projects` and `/blog`.
- **`/projects`** — full curated list as `ProjectCard`s in the order specified in `projects.ts`.
- **`/about`** — long-form bio, written directly in `.astro` or as MDX.
- **`/blog`** — list of all posts (newest first).
- **`/blog/[slug]`** — individual post.
- **`/404`** — terminal-themed not-found (`$ cat: page-not-found: No such file or directory`) with a link home.

## Components

- **`BaseLayout.astro`** — `<html>` shell, fonts (monospace primary), dark theme, `<Nav>`, `<Footer>` slots. Props: `title`, `description`.
- **`Nav.astro`** — top bar styled as a shell prompt (`erinlkolp@web ~ $ cd <link>`). Links: Home, Projects, Blog, About. Mobile: hamburger.
- **`Footer.astro`** — GitHub icon link, LinkedIn link (`https://www.linkedin.com/in/erinlkolp/`), and a "last refreshed: <date>" line.
- **`PromptLine.astro`** — reusable prompt-styled headings (`$ ls projects/`, `$ cat about.md`).
- **`ProjectCard.astro`** — name (linked to repo), description, primary language, star count, last commit date, optional manual blurb.
- **`BlogPostCard.astro`** — title, date, reading time, excerpt.
- **`BlogPostLayout.astro`** — title, date, prose body, prev/next links.

## Visual Style

Terminal / dev aesthetic:
- Dark background (e.g., `#0d1117`)
- Monospace primary font: JetBrains Mono (self-hosted via `@fontsource/jetbrains-mono`), with `ui-monospace, SFMono-Regular, Menlo, monospace` as fallbacks
- Prompt-styled headers and section labels
- Project listings styled like `ls -l` output or fenced code blocks
- Restrained accent colors (GitHub-ish: cyan/blue prompts, green names, muted gray for metadata)

## Data Flow

### Curated project list (`src/data/projects.ts`)

A typed, ordered array. Order in the file = display order.

```ts
export type ProjectEntry = {
  repo: string;           // repo name only; owner is implicit (erinlkolp)
  blurb?: string;         // optional manual one-liner override
};

export const FEATURED: ProjectEntry[] = [
  { repo: "some-repo", blurb: "Optional manual one-liner" },
  { repo: "another-repo" },
  // ...
];
```

### Build-time fetch (`src/lib/github.ts`)

A `fetchRepoData(owner, repos)` function runs during `astro build`. For each repo in `FEATURED`, it calls `GET /repos/erinlkolp/{repo}` and returns `{ name, description, language, stars, htmlUrl, pushedAt }`.

A higher-level helper `getProjects()` is what pages actually call: it imports `FEATURED`, calls `fetchRepoData` for the listed repos, merges each result with its manual entry (manual `blurb` wins over fetched `description` for display when present, but both are kept on the object), and returns the final ordered array. Page frontmatter does `const projects = await getProjects()` and renders.

### Authentication

The build uses a `GITHUB_TOKEN` env var. In GitHub Actions, this is provided automatically by the workflow runner. Locally, dev runs use unauthenticated requests (60 req/hr limit, plenty for development).

### Blog content

Astro Content Collections with a typed schema:

```ts
{
  title: string;
  description: string;
  pubDate: Date;
  tags?: string[];
  draft?: boolean;
}
```

Posts in `src/content/blog/*.{md,mdx}`, queried via `getCollection("blog")`. Drafts skipped in production builds.

### Deploy workflow (`.github/workflows/deploy.yml`)

Triggers:
1. `push` to `main` — rebuild and deploy
2. `schedule: "0 12 * * *"` — daily rebuild at noon UTC to refresh repo stats
3. `workflow_dispatch` — manual trigger from the GitHub UI

Steps: checkout → setup Node → install deps → `astro check` → `astro build` → upload artifact → deploy to Pages.

### Custom domain

`public/CNAME` contains a single line: `becausefuckyouthatswhy.org`. DNS configured separately at the registrar (CNAME or A records pointing at GitHub Pages servers).

## Error Handling

**1. GitHub API failures during build.**
The fetch helper retries once with a small backoff. If the second attempt also fails, it falls back to a placeholder entry (`{ name: repo, description: "(unavailable)", stars: null, ... }`) and logs a warning. A transient API hiccup must not take down the deploy.

**2. Rate limit exhaustion.**
If `X-RateLimit-Remaining: 0`, log clearly and exit with a non-zero status so the Actions run fails loudly. With authenticated requests (5,000/hr) this should not occur in normal operation.

**3. Type validation.**
Manual `projects.ts` entries and GitHub API responses go through Zod (or thin TS guards) before reaching components. A typo in `projects.ts` fails the build with a clear message rather than rendering a broken card.

**4. Runtime.**
The site is fully static; the only runtime surface is the 404 page (`src/pages/404.astro`) styled to match.

## Testing

**1. Type checking** — `astro check` in CI before build.
**2. Build verification** — `astro build` in CI is the de-facto smoke test.
**3. Link check** — `lychee` (or equivalent) crawls `dist/` for broken internal links; fails CI on breaks.
**4. Unit tests for `lib/github.ts`** — Vitest + mocked HTTP. Cases: happy path, retry on transient failure, fallback on permanent failure, rate-limit detection.

Out of scope: E2E tests, visual regression, component snapshots.

## Contact / Links

- GitHub: `https://github.com/erinlkolp` (icon link)
- LinkedIn: `https://www.linkedin.com/in/erinlkolp/`
- No public email
- No contact form

## Open Questions

None at design time. Resolved decisions:

- Build-time data fetch only (no runtime / no serverless refresh)
- Curation via config file, not GitHub topic tag
- Daily scheduled rebuild
- MDX for blog content
- Skip auth for local dev (use 60/hr unauthenticated)
