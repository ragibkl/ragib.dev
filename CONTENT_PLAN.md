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
2. **The user who wouldn't let me turn it off** (drafted:
   `src/content/posts/the-user-who-wouldnt-let-me-turn-it-off.md`), 2017–2020
   - Feb 2017 open-sourced (BIND + nginx in Docker, ~50k domains, forwarding
     to Google). 2017 shut down (USD 5/server, "no longer financially viable"),
     Nov 2017 apology and self-hosting guide.
   - A user in Vietnam finds you on Facebook. Back on DigitalOcean Singapore
     (still today's sg-dns1/2). His requests: malware blocking (by 2018),
     SafeSearch (#23, Feb 2020), a block page (#31), NextDNS-style customisation
     (said no). Slow CDNs from Singapore (#32, #46): Vietnamese hosts blocked
     the ports, Tokyo test server Apr 2020 (#53, today's jp-dns1).
   - French users (#6, Aug 2019): Paris test server (#52, today's fr-dns1).
     Tomatoide from Sept 2020. First thank-you Sept 2018 (#4).
3. **Under the hood: from four hosts files to a Rust compiler** (2017–2021)
   - First GitHub version already used a response-policy zone (`badlist`).
   - 2019 "adblock-v2" compiler; Feb–Apr 2020 Python compiler rewritten in
     Rust (PR #34, #42), the list compiled at image build and baked into the
     Docker image; Feb 2020 null zone.
   - `[?]` Why Rust, and was it your first Rust project?
4. **Most of my outages were my own updates** (published: `src/content/posts/what-self-updating-servers-broke.md`)
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

1. **Building an AAC app for my kids** (published: `src/content/posts/building-an-aac-app-for-my-kids.md`)
   - `[?]` The personal story: what your child needed, what you tried
     (JABtalk and others), and what was missing.
2. **Building it**
   - Jul 2023 onward: React Native/Expo, words and pictures spoken aloud
     (text-to-speech), editable word sets, backup and restore, ready-made
     word sets; a Rust API for searchable symbols.
3. **Living with it**
   - `[?]` How it's used day to day, what changed, what other families
     have said.

## Series 4: Homelab (2025–2026)

One Proxmox box, a network per cluster, and everything reachable from the
internet without a public IP. Told in the order it was built, from
`homelab-vm` (Nov 2025–) and `flux-deploy` (Apr 2025–).

1. **The shape of it: one Proxmox host, a network per cluster**
   - Bridges as networks: vmbr0 is the home LAN, vmbr1 is mine, vmbr2 a
     friend's. An Alpine router VM per network (`vmbr0-alpine-router-vmbr1`)
     routes between them; vmbr2 is reached through both routers.
   - Naming as the map: hostnames start with their network, VMIDs match IPs
     (VM 1021 is `.21`), and every VM is built from a small shell script
     (`alpine-common`, Nov 2025).
   - `[?]` Why Proxmox, and why a network per cluster rather than VLANs or
     one flat LAN? What the host is (RAM is the limit).
2. **From Fedora Kubernetes to Alpine k3s**
   - `flux-deploy` from Apr 2025; the old clusters are in `clusters/archive/`.
     Alpine k3s VMs from Dec 2025 (`alpine-k3s`): one server, two workers.
   - `[?]` What you ran before, why it hurt, why Alpine and k3s.
3. **Public ingress without a public IP**
   - rathole first, then frp through a small VPS (`frp-tunnel-ingress`,
     Sep 2025; `alpine-frps`, Nov 2025): haproxy on 80/443 passes TCP with
     the PROXY protocol, so ingress-nginx still sees real client IPs.
   - The VPS has no host firewall; the provider's cloud firewall does the job.
   - `[?]` Why frp over rathole, Cloudflare Tunnel or Tailscale Funnel.
4. **GitOps with Flux and SOPS, and wildcard certificates**
   - Dec 2025: Flux, SOPS-encrypted secrets with age, cert-manager.
   - Sep 2026: wildcard certificates through acme-dns (`acme.ragib.dev`), and
     the `_acme-challenge` record that silently hid the parent wildcard.
5. **Hosting a friend's cluster**
   - vmbr2: its own router, frps VPS (`vmbr2.ingress`), Flux repo and alerts,
     on the same Proxmox host; kubectl reaches it through a SOCKS tunnel over
     both routers.
   - `[?]` Is your friend happy to be written about? How the split works in
     practice: who owns what, what they can and can't touch.
6. **SSH into everything with the keys on GitHub** (see also keytree below)
   - Nov 2025: `github-keys.sh`, an sshd `AuthorizedKeysCommand` that fetched
     `github.com/<user>.keys` for users listed per network.
   - What was wrong with it: the key cache lived on tmpfs, so a reboot while
     GitHub or the internet was down left root with no keys; every GitHub
     user listed got root on every server of that network.
   - Sep 2026: replaced by **keytree** (Go, open source): one `keytree.yaml`
     in a public repo (users, groups, servers by hostname or glob, accounts),
     synced hourly by every server into a marked block of `authorized_keys`.
     Fails safe (a fetch error never removes access), refuses symlinks,
     `revoked:` for single keys.
   - Testing root writes into other people's home directories: 5,000 random
     cases, symlinks to a stand-in `/etc/shadow`, crash between write and
     rename, real sshd logins in Alpine and Ubuntu containers.
   - The rollout: 21 servers (13 homelab VMs, 2 VPSes, 7 Bancuh DNS nodes) in
     a day, each with a spare SSH connection held open and a fresh-login test
     before removing the old command. And the 13 minutes where deleting the
     old user lists early would have locked out any rebooting VM.
   - `[?]` Why not Tailscale SSH, Teleport or SSH certificates? Would you use
     it at work?
7. **Developing from anywhere with Coder**
   - Sep 2026: Coder on an Ubuntu VM (Sysbox, because Alpine can't), GitHub
     login through your own OAuth app, commit signing with the workspace key,
     wildcard app URLs through the same frp ingress.
   - `[?]` What you develop on, and from where (phone, laptop, work machine).
8. **Remote access and the rest**: OpenVPN VMs per network (Dec 2025), ddns,
   Jellyfin and its decommissioning, what fits in the RAM that's left.
   `[?]` Which of these are worth a post of their own.

Side posts, any time: monitoring without Prometheus (private Gatus per
cluster, Flux alerts to Telegram); and **Rolling out a security fix to a public
DNS service** (Bancuh port 1153, Sep 2026: found from outside, fixed one node
at a time, and the ~75 s unfiltered window every restart revealed, #220).

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
4. Homelab #6 (keytree) can go early and stand alone: it's the freshest, and
   the tool is public for others to use.

Then continue each series in order.
