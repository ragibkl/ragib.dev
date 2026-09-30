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
5. **Users asked for encrypted DNS** (published as post 7: `src/content/posts/users-asked-for-encrypted-dns.md`)
   - Feb 2022: dnsdist in front of BIND for DoH/DoT, with certbot.
   - Later dnsdist-acme: in-process ACME, and the logs page.
6. **Replacing BIND with my own DNS server** (published as post 5: `src/content/posts/replacing-bind-with-my-own-dns-server.md`)
   - Dec 2023: bancuh-dns written in Rust with RocksDB (#191).
   - The catch: replacing BIND also removed recursion, so it forwarded to
     public resolvers again.
7. **The leak test that kept me honest** (published as post 6: `src/content/posts/the-leak-test-that-kept-me-honest.md`)
   - Mar 2024: an internal BIND as the resolver behind bancuh-dns (#200).
   - Aug 2026: dnsleaktest.com's malformed EDNS answer, a bug that turned
     failures into empty answers, and the switch to Unbound (#218).
8. **Eleven years of running a free DNS service**: the retrospective. Draft
   outline in `src/content/posts/eleven-years-of-bancuh-dns.md`.

Side posts, any time after 5: monitoring DoH properly (dns-monitor, Gatus),
and benchmarking DNS filters at 8 million entries (once dns-filter-bench exists).

## Series 2: simplesolat (2025–2026)

1. **Why I built a prayer times app** (published: `src/content/posts/why-i-built-a-prayer-times-app.md`)
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
2. **Starting from JABtalk** (published: `src/content/posts/starting-from-jabtalk.md`), Jul 2023 – Feb 2024
   - JABtalk as the blueprint. Kept: folders, the passcode gate, backup and
     restore (used to copy boards between two tablets). Changed: backups as
     hand-editable YAML (which became templates), a language per word instead
     of audio recording, symbol search in the app instead of Google Images in
     a browser.
   - Sep 2023: a Play Store review from a parent who lost everything past
     AsyncStorage's ~2 MB; storage moved to files in Oct (#8).
   - Feb 2024: requests from parents and teachers at Permata Kurnia (#10–#19).
3. **Where the pictures come from** (published: `src/content/posts/where-the-pictures-come-from.md`), Aug 2023 – Sep 2026
   - senteacher.org as a test (requests started failing, the API changed),
     briefly opensymbols.org, then api-gibtalk in Rust (Oct 2023): fast, and
     picture URLs live on every device and in every template, so they must
     never move. Stateless: ARASAAC, Mulberry and Tawasol, downsized and baked
     into the Docker image.
   - Filename search, then Apr–May 2026: Claude Code tags every image from
     what it sees; tags saved as static YAML. Sep 2026: the last senteacher
     pictures replaced (#26), and the public /symbols/ page.
4. **Living with it**
   - `[?]` How it's used day to day, what changed, what other families
     have said.
   - Ends with the template builder (Sep 2026) as an open experiment: the
     teachers drafted sets in Microsoft Word with the old search; will better
     tools help them make more?

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
6. **SSH into everything with the keys on GitHub** (published as a standalone: `src/content/posts/keytree-ssh-keys-from-one-file.md`)
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
9. **The SSD that never heard about the deleted files** (Sep 2026)
   - The old Jellyfin VM's 4 TB SATA SSD, picked to host self-hosted S3: under
     a sustained write it stalled for minutes, the kernel reset the link, and
     ext4 went read-only. SMART was clean; it ran at 69–78 °C.
   - A controlled write test: 1–2 MB/s, 17 seconds per 1 MB write, heating up
     while doing almost nothing.
   - The cause: the Proxmox disk had no `discard=on`, so QEMU dropped every
     TRIM. After years of downloads coming and going, the drive thought ~3 TB
     of deleted data was live. One `fstrim` (2.9 TB + 0.7 TB) later: 300–500
     MB/s, idling at 40 °C instead of 69 °C.
   - Then checking everything else: every other VM had `discard=on`, but
     Alpine ships no trim job, and busybox `fstrim` has no `-a` (two rollout
     attempts that silently did nothing). A weekly job on all 12 Alpine VMs
     gave back 267 GB of the NVMe thin pool, some of it from inside Longhorn
     volumes.
   - How other systems handle it (Ubuntu, Fedora, Debian timers; Windows;
     Arch leaves it to you), and why `discard` as a mount option isn't the
     default.
   - `[?]` Did you know the drive was that slow before? How long had it been
     like that (Jellyfin era)?
10. **Bringing Nextcloud's files home** (Sep 2026)
    - Why S3 in the first place (files pile up forever; restore should be
      simple) and why it felt slow: measured, 60% of a thumbnail's 250 ms was
      the round trip to Wasabi.
    - Shopping for a faster provider, and a measurement mistake worth
      admitting: anonymous "bucket not found" requests made Wasabi look 50×
      slower; real reads showed Linode only a little faster. Not worth moving
      for.
    - MinIO's community edition had just been archived; Garage instead, on the
      ex-Jellyfin VM (renamed, upgraded Alpine 3.17 → 3.24 one release at a
      time, SSH through keytree). One bucket and one key per app.
    - The detail that could have lost 300k thumbnails: Nextcloud bakes the
      bucket name into its storage id, so the new bucket had to keep the old
      name.
    - The move: 197 GB copied overnight at a 250 Mbit/s cap (the router VM
      wasn't the bottleneck), 0 differences, under 2 minutes in maintenance
      mode. Thumbnails 246 → 53 ms, full photos 375 → 56 ms.
    - Wasabi becomes the offsite copy: hourly `rclone copy`, nightly `sync`,
      versioning so a sync can never really delete, and a cap on deletions.
    - `[?]` What felt slow day to day? Anything you'd have done differently?
11. **Untangling a config carried over from the VM days** (Sep 2026)
    - Nextcloud had settings in three places: `config.php`, 2019-era copies of
      the image's config files, and a ConfigMap with credentials in plain text.
      Placeholder database passwords, and cloud keys with account-wide access
      shared between clusters.
    - Rotating to one bucket-scoped key per job, verified with test backups,
      and a SOPS file whose checksum had been broken since a rename.
    - Layers with one job each: `config.php` for Nextcloud's own state, `NC_`
      env for simple settings and secrets, the image's env-driven files for
      structured ones. Two surprises from reading Nextcloud's code: it writes
      its whole merged config back to `config.php` on every save (how the
      duplicates got there), and env names with dots never reach PHP.
    - Checked by hashing all 47 effective settings before and after.
    - Also: MariaDB system tables never upgraded since 10.x under a floating
      `11.4` tag, found only because a dump failed.
    - `[?]` How the Nextcloud setup started (which VM, which year).

Side posts, any time: monitoring without Prometheus (private Gatus per
cluster, Flux alerts to Telegram; what was removed and why checks beat graphs
for a homelab); **When Bitnami's images went away** (moving a friend's ERP
database off `bitnamilegacy/mariadb:10.6` to the official image, with a
dump, a checked restore and the site's own hard-coded DB host; `[?]` ask the
friend first); **A caching proxy for WordPress, rebuilt** (the old
wordpress-proxy image vs. a template for the official nginx image, the cache
key that could be poisoned, CI that tests a fresh WordPress);
**Cleaning up a compromised WordPress site** (`[?]` only with the site
owner's OK, and without details that help an attacker: what gave it away,
demoting instead of deleting users, rotating everything, and broken images
left behind by an old media-offload plugin); and **Rolling out a security fix to a public
DNS service** (Bancuh port 1153, Sep 2026: found from outside, fixed one node
at a time, and the ~75 s unfiltered window every restart revealed, #220).
The same post, or a follow-up, can cover **bringing all seven nodes up to
date** (29–30 Sep 2026): Alpine 3.19 (out of support since Nov 2025) to 3.24
on Linode, where jumping straight to 3.24 broke apk and one node would never
have restarted Docker after a reboot; the two Singapore nodes rebuilt from
Ubuntu 16.04 to 24.04 in place, keeping their IPv4 and IPv6 (DigitalOcean
rebuild, and a forced root password change that blocked even SSH keys); the
Paris nodes on Scaleway, whose own key agent rewrote `authorized_keys` and
locked keytree out mid-update. Every node measured from outside: each reboot
cost 20–110 s, plus the unfiltered window.

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
5. Homelab #9 (TRIM) also stands alone and is useful to anyone on Proxmox;
   #10 and #11 can follow it as a pair.

Then continue each series in order.
