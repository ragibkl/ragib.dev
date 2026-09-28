# Content plan

Posts are told as **series, in the order things happened**. Each post starts
from the decision the previous one left behind, so a reader can start at the
beginning of a series and follow along.

Dates come from git history and GitHub issues. `[?]` marks things only I know,
to answer before drafting.

How drafting works: Claude drafts from the repos and issues, leaving
`[Your take: …]` gaps. I answer them roughly, the answers get folded in, then I
read it once as a reader and publish.

---

## Series 1: Bancuh DNS (2015–2026)

1. **Blocking ads for the whole house: how Bancuh DNS started** (drafted:
   `src/content/posts/how-bancuh-dns-started.md`)
   - 2015: learning web hosting, DNS clicks as an ad blocker. Raspberry Pi 2
     at home with BIND zones and a Python script, using AdAway-era lists.
   - Power cuts and SD cards: moved to two rented servers, went public.
   - "ADblock your Wifi" blog series, Dec 2015 – Jan 2016 (recovered in
     `sources/2015-bancuh-blog/`), including trust and privacy, and the promise
     not to block torrents.
   - `[?]` The Facebook story: the servers shut down, and a user tracked you down.
2. **From zones to RPZ, and learning BIND on the way**
   - The first GitHub commit (Feb 2017) already uses a response-policy zone
     (`badlist`) and a Python "crawler" building it from hosts files.
   - 2019 "adblock-v2" compiler rewrite; Feb 2020 null zone.
   - First strangers using it: the "quick thanks" issue, Sept 2018 (#4).
   - How the scope grew from "adservers only" (2016) to a strict family filter.
3. **Rewriting the list compiler in Rust**
   - Feb–Apr 2020: Python compiler replaced by Rust (PR #34, #42). The list
     is compiled at image build time and baked into the Docker image.
   - Servers added in Paris and Tokyo (Apr 2020, #52, #53).
4. **Compiling on start, and what self-updating servers broke**
   - May 2021: BIND stops forwarding and resolves from the root itself (#92, PR #105).
   - Jun 2021–Jul 2022: config fetched from GitHub, list compiled when BIND
     starts, servers self-update.
   - What broke: memory and OOM kills (#154, #162), 2–3 min downtime per
     update (#57, #58), certificates not reloading (#148), daily drops from a
     panicking fetch (#172).
5. **Users asked for DoH and DoT**
   - Feb 2022: dnsdist in front of BIND for DoH/DoT, with certbot.
   - Later dnsdist-acme: in-process ACME, and the logs page.
6. **Replacing BIND with Rust: from 6+ GB to under 512 MB**
   - Dec 2023: bancuh-dns written in Rust with RocksDB (#191).
   - The catch: replacing BIND also removed recursion, so it forwarded to
     public resolvers again.
7. **Getting recursion back: BIND inside, then Unbound**
   - Mar 2024: an internal BIND as the resolver behind bancuh-dns (#200).
   - Aug 2026: dnsleaktest.com's malformed EDNS answer, a bug that turned
     failures into empty answers, and the switch to Unbound (#218).
8. **Eleven years of running a free DNS service**: the retrospective. Draft
   outline in `src/content/posts/eleven-years-of-bancuh-dns.md`.

Side posts, any time after 5: monitoring DoH properly (dns-monitor, Gatus),
and benchmarking DNS filters at 8 million entries (once dns-filter-bench exists).

## Series 2: simplesolat (2025–2026)

1. **Why I built a prayer times app**
   - `[?]` What existing apps got wrong for me: ads, accuracy, widgets,
     offline, zones?
   - Jul 2025: first version.
2. **v1: an app and an API with Postgres**
   - Nov 2025: simplesolat-api in Rust, with Postgres tables for zones and
     prayer times, plus sync workers.
   - Mar 2026: Play Store listing.
3. **Rethinking the data: static files for nine countries**
   - Apr 2026: simplesolat-data on Netlify. Official timetables from each
     country's religious authority, zones mapped with GeoJSON
     (point-in-polygon), and odd cases like Bosnia's perpetual timetable
     and Albania using Turkey's Diyanet data.
   - App 1.1.x reads the CDN directly and stops using the API.
   - `[?]` What made you move off the API?
4. **Deleting the database**
   - Sep 2026: the API drops Postgres and sync, and becomes a stateless proxy
     over the CDN, kept only for 1.0.x installs.

## Series 3: GibTalk (2023–)

Written for other parents of autistic children as much as for developers.

1. **Why I built an AAC app for my child**
   - `[?]` The personal story: what your child needed, what you tried
     (JABtalk and others), and what was missing.
2. **Building it**
   - Jul 2023 onward: React Native/Expo, words and pictures spoken aloud
     (text-to-speech), editable word sets, backup and restore, ready-made
     word sets; a Rust API for searchable symbols.
3. **Living with it**
   - `[?]` How it's used day to day, what changed, what other families
     have said.

## Series 4: Homelab (2024?–2026)

1. **From Fedora Kubernetes to Alpine k3s** `[?]` Dates and what you ran before.
2. **Public ingress without a public IP**: rathole, then frp through a VPS
   with the PROXY protocol.
3. **GitOps with Flux and SOPS, and wildcard certificates with acme-dns**,
   including the `_acme-challenge` record that hid the wildcard.
4. **Developing from anywhere with Coder workspaces.**

## One-offs

- **An immutable desktop**: Fedora Silverblue with custom BlueBuild and
  toolbox images (2024–).
- **Learning Rust with *Zero to Production*** (2021), and how Rust spread
  through every project after.

---

## Publishing order

Series can interleave. Suggested start:

1. Bancuh DNS #1: everything else in that series depends on it.
2. GibTalk #1: the one most likely to help someone.
3. simplesolat #1.

Then continue each series in order.
