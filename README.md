# blog.justdev.cn

Personal website and blog, built with [Astro](https://astro.build) and deployed on [Vercel](https://vercel.com).

Forked from [steipete/steipete.me](https://github.com/steipete/steipete.me) (AstroPaper theme, originally by [Sat Naing](https://github.com/satnaing)).

## Project Structure

```text
├── public/               # Static assets (images, fonts, favicon)
│   ├── assets/          # Images for blog posts
│   └── fonts/           # Web fonts
├── src/
│   ├── assets/          # Icons and images used in components
│   ├── components/      # Reusable UI components
│   │   └── ui/          # React components
│   ├── content/         # Content collections
│   │   └── blog/        # Blog posts in Markdown format (organized by year)
│   ├── layouts/         # Page layouts and templates
│   ├── pages/           # Routes and pages
│   ├── styles/          # Global styles and CSS
│   └── utils/           # Utility functions
├── astro.config.mjs     # Astro configuration
├── vercel.json          # Vercel deployment and CSP configuration
├── package.json         # Project dependencies and scripts
└── LICENSE              # Dual license (CC BY 4.0 + MIT)
```

## Commands

| Command            | Action                                      |
| :----------------- | :------------------------------------------ |
| `pnpm install`     | Installs dependencies                       |
| `pnpm run dev`     | Starts local dev server at `localhost:4321` |
| `pnpm run build`   | Build the production site to `./dist/`      |
| `pnpm run preview` | Preview the build locally, before deploying |

## Deployment

Deployed on Vercel. Connect this repo in the Vercel dashboard and bind the `blog.justdev.cn` domain.

## License

- **Documentation & Blog Posts** (upstream author's content): [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)
- **Code & Code Snippets**: [MIT License](LICENSE)

See the [LICENSE](LICENSE) file for full details.

## Acknowledgements

- [Peter Steinberger](https://github.com/steipete) — upstream repository
- [Sat Naing](https://github.com/satnaing) — original AstroPaper theme
