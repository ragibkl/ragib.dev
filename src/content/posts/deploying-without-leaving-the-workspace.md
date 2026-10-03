---
title: "Deploying without leaving the workspace"
description: "How my homelab went from clicking in Rancher to a Git repository that Flux deploys, and why that turned out to be exactly what Claude Code needed to ship my sites and services from a workspace, often while I'm on my phone."
date: 2026-10-03T08:39:00Z
draft: false
tags: [claude-code, coder, gitops, flux, kubernetes, homelab]
---

*This is part two of a short series on working with Claude Code from a
remote workspace. [Part one](/writing/a-workspace-that-keeps-working/) is why
the work moved off my laptop, and [part three](/writing/giving-the-workspace-a-browser/)
is how it learned to check what it builds.*

When I first set up a Kubernetes cluster at home, I managed it with
[Rancher](https://www.rancher.com). Rancher gives you a web interface for
everything: deploy an app, change an image, add a secret, all with a few
clicks. That made it easy to start, and easy to make mistakes. Nothing kept a
record of what I'd clicked, so when something broke, I had to remember what I'd
changed, and when I wanted to set something up again, I had to remember how.

## Moving to a repository

Then I found [Flux](https://fluxcd.io). With Flux, the cluster's desired state
lives in a Git repository, and Flux, running inside the cluster, keeps making
the cluster match it. I set mine up in April 2025, in a repository called
`flux-deploy`. To deploy something, I changed a file, pushed it, and waited.
I still watched the result in Rancher's interface, and later, on the newer
cluster, in Headlamp, but I stopped changing things there.

It made upgrades easy. An upgrade is a new version number in a file, and if it
goes wrong, the previous version is one commit back. Secrets went into the same
repository, encrypted with [SOPS](https://github.com/getsops/sops), so anyone reading the
repository sees only scrambled text. That came later than it should have, I'll admit. My
earlier deployments had database passwords in plain text. They've all been
changed since.

None of this was about AI. It was about having the setup written down
somewhere other than my memory.

## It suited Claude Code, too

What I didn't expect was how well this would suit Claude Code. When I started
using it on my laptop, deploying was one of the first things it could do
almost entirely on its own, because every step is something it already knows
how to use.

When I say "ship it", it opens a pull request on the project, and merges it
once the checks pass. Merging to the main branch starts a GitHub Actions
build, which tags the image with the commit it came from. Claude Code watches
the build with GitHub's command-line tool, `gh`, and when the image is ready,
changes that one tag in `flux-deploy` and pushes. Flux picks it up, and Claude
Code watches the rollout with `kubectl` until the new version is running.

It's quick. When [the previous post](/writing/giving-the-workspace-a-browser/)
went out, its pull request was merged at 23:37, the image was built and
checked in about a minute, and the change to `flux-deploy` went in at 23:38.

The app repositories use pull requests, but Claude Code pushes to
`flux-deploy` directly. That's on purpose. It's the natural flow: build on
merge, wait for the image, push the deploy. I wanted Claude Code to do most of
the work, so I could take my hands off it. The checkpoint is earlier, when I
say "ship it".

## Shipping from my phone

Moving the work [into the workspace](/writing/a-workspace-that-keeps-working/)
didn't change any of that. The workspace sits inside my home network, with the
same tools, so the same flow just carried on, without my laptop.

A lot of the time, I say "ship it" from my phone. When Claude Code updates one
of my websites, it runs the site in the workspace, and I open it on my phone
through Coder's link for that port. If it looks right, I type two words into
the Claude app, and a few minutes later it's live. I type faster at a desk, on
a full keyboard, but for "ship it", the phone is enough.

## Mostly uneventful

For websites and APIs, it's usually boring, which is what I want. Most
deploys, like the [simplesolat](/writing/nine-countries-and-no-database/) API,
are "ship it", and then it just works.

The small surprises are the interesting ones. When GibTalk moved to its own
domain, gibtalk.com, the old addresses had to redirect to it, keeping the rest
of the address so old links still landed on the right page. The cluster's
ingress wouldn't allow that kind of redirect, so the first version sent every
old link to the home page. The fix was to do the redirect in the site's own
web server instead. When I added www.ragib.dev, the certificate wouldn't issue
at first. My DNS records were right, but the resolvers had looked up the name
before I added it, and remembered for up to an hour that it didn't exist.
Claude Code worked that out, told me nothing was wrong, and checked again
later.

When a rollout didn't go as expected, it usually knew how to sort it out
quickly. I can't remember a specific one, which probably says something.

## When it matters

The bigger changes are the ones it prepares for. My cluster's storage,
[Longhorn](https://longhorn.io), can snapshot a volume and back it up to S3.
That used to be the last bit of clicking I still did: before anything risky, I
opened Longhorn's web interface and took the snapshots by hand. Now Claude Code
does it with `kubectl`, as part of the job, and I don't open that page any
more. Before it upgraded the
database behind a WordPress site I host, from MariaDB 10.7 to 11.8, it took a
snapshot and a full dump of the database first. When it upgraded Nextcloud
from version 32 to 34, it went one major version at a time, with a snapshot
before each step.

Some changes need me, and it knows which. DNS is one of them: my records live
with my DNS provider, outside the repository, and only I change them. When it
set up acme-dns, for the wildcard certificate the workspace's links need, one
of the new records had a side effect. My ingress names are covered by a
wildcard record, and adding a record under the workspace's name made that name
exist on its own, so the wildcard stopped answering for it and for everything
under it. Claude Code worked out why, and told me through Remote Control on my
phone exactly which records to add so the names resolved again. It also left a
note in the repository, so the next certificate doesn't trip over the same
thing.

## The guardrails

A few rules keep this safe enough for me to step back. Secrets stay encrypted
in the repository. My home network is split into separate networks, and
nothing it deploys may open a way between them; if a feature needs that, it
waits. And nothing goes out without me saying so.

When something does go wrong, I hear about it. Flux sends failures to me on
Telegram, and a set of health checks covers every service, layer by layer, so
an alert says which part broke.

## Why it works

Looking back, Flux was the most important choice, and I made it long before
Claude Code. Because everything about my cluster is in files, in one
repository, Claude Code can read how it's set up, change it, and see what
happened, using the same tools I would. Clicking through Rancher, it would
have been as lost as I was.

What the workspace added is that I don't have to be there. I say "ship it",
put my phone away, and the next time I look, it's live.
