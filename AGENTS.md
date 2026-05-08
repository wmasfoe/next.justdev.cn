# AGENTS.md

## New Blog Post Workflow

- If user says "new blog post" without topic/title: ask for topic/title first.
- Pick branch name: short slug from topic/title.
- Scaffold directory: `src/content/blog/<slug>/index.md`.
- Frontmatter: only set `title` from user input; keep required placeholders minimal (`description: "TBD"`, `draft: true`, `pubDatetime: <today>`).
- No body content; no invented outline.
- Open editor: `code src/content/blog/<slug>/index.md`.

## Image Workflow (Scheme C)

- Images live alongside the post: `src/content/blog/<slug>/hero.png`, `screenshot.jpg`, etc.
- In frontmatter, use relative path: `heroImage: './hero.png'` (Astro will optimize it).
- In Markdown body, use relative paths: `![alt](./screenshot.jpg)` or import + `<Image>` component.
- Astro's image pipeline auto-generates optimized versions (webp, srcset, etc.).
- **No need for git hooks** — images stay with the post, deleted together.
