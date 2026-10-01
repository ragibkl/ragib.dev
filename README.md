# ragib.dev

My personal site: notes on things I've built outside work, and what they
taught me. Built with [Astro](https://astro.build) and served as static files
by nginx.

## Writing a post

Add a Markdown file to `src/content/posts/`. The file name becomes the URL
(`/writing/<file-name>/`).

```md
---
title: "Post title"
description: "One sentence, used in lists, RSS and link previews."
date: 2026-09-28
draft: true
tags: [dns, homelab]
---
```

Drafts show up in `npm run dev` only. Set `draft: false` to publish.

## Development

Uses the Node version in `.tool-versions` (mise or asdf will pick it up).

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # type-checks, then builds to dist/
npm run preview  # serves dist/
```

## Where things are

| Path                     | What                                       |
| ------------------------ | ------------------------------------------ |
| `src/content/posts/`     | Blog posts                                 |
| `src/data/projects.yaml` | The Projects page, and the home page cards |
| `src/lib/content.ts`     | Name, tagline and links                    |
| `src/pages/`             | Pages, the RSS feed and the 404 page       |
| `src/styles/global.css`  | Colours, type and layout                   |

## Releasing

CI builds the site on every pull request and push, then publishes
`ghcr.io/ragibkl/ragib.dev:sha-<short sha>`. To roll out, set that tag in
`ragibkl/flux-deploy` (`clusters/vmbr1-k3s/services/ragib-dev/ragib-dev.yaml`).

## Licence

The writing on this site (everything in `src/content/`) is under
[CC BY 4.0](LICENSE): you can share and adapt it, as long as you credit me and
link back. The site's code is under the [MIT licence](LICENSE-CODE).
