# ragib.dev Blog Setup

## Goal
Set up a Hugo blog at ragib.dev, deployed via Netlify.

## Decisions Made
- **Domain**: ragib.dev (ragib.my reserved for future use)
- **Stack**: Hugo static site generator
- **Theme**: PaperMod (added as git submodule)
- **Hosting**: Netlify (free tier, auto-builds Hugo)
- **Repo name**: ragib.dev
- **Hugo install**: project-local via mise (pinned to 0.161.1)

## Setup Steps
1. [x] Scaffold Hugo site structure
2. [x] Add PaperMod theme
3. [ ] Push to GitHub
4. [ ] Connect repo to Netlify (auto-detects Hugo via netlify.toml)
5. [ ] Point ragib.dev DNS to Netlify
6. [ ] Netlify handles HTTPS automatically

## No Dockerfile needed
Netlify builds Hugo natively — `netlify.toml` pins `HUGO_VERSION` so local and CI match.

## First post
Draft at `content/posts/migrating-from-fedora-k8s-to-alpine-k3s.md` — `draft: true`,
section stubs ready to fill in.

## Notes
- No landing page needed yet — blog IS the homepage (PaperMod `homeInfoParams`)
- Might try Zola later (Netlify supports it too)
- Truly zero maintenance: push markdown → site updates
- PaperMod emits two deprecation warnings against Hugo 0.158+ — harmless, upstream issue
