# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical guidelines

- **Do not create blog posts without explicit user consent.** Only edit/fix existing posts unless asked to scaffold one. The blog post scaffolding workflow (slug → branch → minimal frontmatter, no invented body) is described in [AGENTS.md](AGENTS.md) — follow it when asked.
- **Do not run `pnpm run dev`** in agent mode — it is a long-running server and will hang the agent. Use `pnpm run build` (or `pnpm run sync` + type-check) to verify changes.
- **Use `gsed` instead of `sed`** for any in-place text substitutions — macOS BSD sed lacks GNU features used in this repo's tasks.
- **Never downgrade dependencies.** Check latest with `pnpm outdated` / `pnpm view <pkg> version` and fix breakage forward, not by pinning back. Node `>=24` and `pnpm@10.33.2` are required (see `package.json` `engines` / `packageManager`).

## Commands

This repo uses **pnpm** (not npm). The lockfile is `pnpm-lock.yaml`.

```bash
pnpm install                 # Install (use --frozen-lockfile in CI; vercel.json does this)
pnpm run build               # astro build && pagefind --site dist  (production output to ./dist)
pnpm run build:check         # astro check (typecheck) + build + pagefind
pnpm run sync                # Regenerate astro:content types after content/schema changes
pnpm run preview             # Serve ./dist locally (only run when explicitly requested)
pnpm run lint                # oxlint --deny-warnings (src + astro.config.mjs)
pnpm run lint:fix
pnpm run format              # oxfmt --write across tracked JS/TS/JSON
pnpm run check               # format:check + lint  (run before committing)
pnpm run check:fix           # format + lint:fix
```

There is **no test suite** in this project — do not invent test commands. The `.eslintrc.cjs` is residual; linting is actually done by **oxlint**, and formatting by **oxfmt** (`.oxfmtrc.json`). A husky `pre-commit` hook runs `lint-staged`, which formats + lints staged files in `src/`, `astro.config.mjs`, and root JSON/mjs/cjs.

## Architecture

Astro 5 static site (Vercel-deployed) with React 19 islands, MDX content, Tailwind v4, and Pagefind search.

**Content collection** ([src/content.config.ts](src/content.config.ts)): a single `blog` collection loads `**/index.{md,mdx}` from `src/content/blog/<slug>/`. Each post is a directory so co-located images can be referenced as `./hero.png` in frontmatter and `![](./img.jpg)` in the body — Astro's image pipeline optimizes them. The Zod schema is the source of truth for frontmatter (required: `title`, `description`, `pubDatetime`; common optional: `draft`, `unlisted`, `featured`, `tags`, `heroImage`, `ogImage`, `modDatetime`, `source`). After changing the schema, run `pnpm run sync`.

**Site config** ([src/consts.ts](src/consts.ts) and [src/constants.ts](src/constants.ts)): the `SITE` object (timezone `Asia/Shanghai`, lang `zh-CN`, author, edit-on-GitHub URL, dynamic OG image flag, etc.) drives layouts, sitemap, and OG image generation. [src/config.ts](src/config.ts) re-exports both for compatibility — import from `@/config` (the `@` → `/src` alias is set in `astro.config.mjs`).

**URL routing & redirects.** Posts live at `/posts/<slug>`. Three layers handle legacy URLs from the old WordPress/Jekyll site:

1. [vercel.json](vercel.json) — production redirects for `/YYYY/MM/DD/slug`, `/blog/...`, `/categories/...`, `/tag/:tag`, plus a host-level redirect that forces `blog.justdev.cn`. It also has `rewrites` that serve `.md` versions of pages when the request `Accept: text/markdown`.
2. [src/middleware.js](src/middleware.js) — runtime fallback for `/blog/*` → `/posts/*` (covers dev and any path the static rules miss).
3. [astro.config.mjs](astro.config.mjs) sitemap `serialize` — assigns `priority`/`changefreq` per URL pattern (homepage, recent years, tags, pagination); strips trailing slashes.

When changing URL structure, update **all three** plus any post `canonicalURL` frontmatter.

**Search.** Pagefind is run as a post-build step (`astro build && pagefind --site dist`) — it indexes the static HTML in `dist/` and produces `/pagefind/`. The search UI ([src/pages/search.astro](src/pages/search.astro)) loads that bundle. Pagefind output won't exist after `astro dev`; only after `pnpm run build`.

**OG images.** [src/utils/generateOgImages.ts](src/utils/generateOgImages.ts) + `og-templates/` use Satori + `@resvg/resvg-js` to generate per-post OG images at build time when `SITE.dynamicOgImage` is true. `@resvg/resvg-js` is excluded from Vite's optimizeDeps (native binary).

**PWA.** `@vite-pwa/astro` is configured in `astro.config.mjs` with `registerType: "autoUpdate"`, an offline `navigateFallback: "/404"`, and CacheFirst runtime caches for Google Fonts and images. PWA is **enabled in dev** (`devOptions.enabled: true`), which can cause stale-asset confusion locally — hard-reload or unregister the SW if you see it.

**Markdown pipeline.** Remark plugins: `remark-toc`, `remark-collapse` (collapses the TOC under "Table of contents"), and a local [src/utils/remarkLazyLoadImages.mjs](src/utils/remarkLazyLoadImages.mjs). Shiki themes are `min-light` / `night-owl` with `wrap: true`.

**CSP.** Vercel sets a strict Content-Security-Policy in `vercel.json`. Adding a new third-party script/iframe (analytics, comments, embeds) requires updating the CSP header there — not just the component (see commit `fe65624` which whitelisted giscus.app for comments).

## Adding / editing blog posts

- One directory per post: `src/content/blog/<slug>/index.md` with co-located images (`./hero.png`, etc.). See [AGENTS.md](AGENTS.md) for the scaffold rules.
- `pubDatetime` must parse as a Date (ISO-8601 with offset, e.g. `2025-11-09T10:00:00+08:00`). `tags` must be an array (defaults to `["others"]`).
- Set `draft: true` while in progress — drafts are filtered out of indexes by [src/utils/postFilter.ts](src/utils/postFilter.ts) / `getSortedPosts.ts`. `unlisted: true` keeps a post reachable by URL but hides it from listings.
- After adding/renaming a post, no manual indexing step is needed — Astro's content layer picks it up. If types feel stale in the editor, run `pnpm run sync`.

## Things that look like they exist but don't

- `scripts/deploy.sh`, `scripts/add-source-metadata.mjs`, `scripts/remove-tags-from-posts.mjs` are referenced in `package.json` scripts (`deploy`, `add-source-metadata`, `remove-tags`) but the `scripts/` directory is not in the repo. Do not assume those commands work.
- `.eslintrc.cjs` exists but is unused — lint is oxlint.
