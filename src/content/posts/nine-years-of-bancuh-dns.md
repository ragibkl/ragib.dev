---
title: "Nine years of running a free DNS service"
description: "What I learned running Bancuh DNS, a free public adblock DNS service, on my own time and money since 2017."
date: 2026-09-28
draft: true
tags: [dns, bancuh-dns, self-hosting]
---

> **Draft: facts and outline, not the post.** Each section has the facts, with
> links to where they came from, and a question or two. Write each section in
> your own words, then delete the notes. Set `draft: false` and update `date`
> to publish. Cut anything that isn't interesting to you.

## How it started

- 2017: `adblock-dns-server` created on GitHub as an ad-blocking DNS server
  for personal use.
- The name: bancuh.com was a spare domain. Users started calling the service
  "Bancuh DNS" and it stuck. *Bancuh* is Malay for *to mix*, and the
  blocklist is a mix of dozens of lists.
- Sept 2018: the first "quick thanks" issue from someone you didn't know
  ([#4](https://github.com/ragibkl/adblock-dns-server/issues/4)).
- Today: 7 servers in Singapore (DigitalOcean), Tokyo (Linode), Paris
  (Scaleway) and Dallas (Linode). About 110 GitHub issues over the years.

**Your words:** Why did you build it in the first place? When did you realise
strangers depended on it? What does it cost you each month?

## Lesson: memory was always the constraint

- BIND with a multi-million-entry blocklist used a lot of memory
  ([#191](https://github.com/ragibkl/adblock-dns-server/issues/191)).
- The list compiler used almost 1 GB to process 2.5 million entries, and the
  OOM killer took out `named`
  ([#162](https://github.com/ragibkl/adblock-dns-server/issues/162)).
- After adding self-updates in 2022, servers kept crashing: `named` was
  killed, but the container stayed up with no DNS inside it
  ([#154](https://github.com/ragibkl/adblock-dns-server/issues/154)).
- Dec 2023: rewrote the filtering server in Rust (`bancuh-dns`) with RocksDB
  on disk. It now idles at around 100 MB plus the resolver.
- Later benchmarked against Pi-hole, Blocky and AdGuard Home at 7.8 million
  entries on 1 vCPU
  ([COMPARISON.md](https://github.com/ragibkl/bancuh-dns/blob/master/COMPARISON.md)).

**Your words:** What did the crashes feel like from your side? Was the Rust
rewrite about memory, or also about wanting to write Rust?

## Lesson: most downtime was self-inflicted

- Every blocklist update meant 2–3 minutes of downtime, and users noticed
  ([#57](https://github.com/ragibkl/adblock-dns-server/issues/57),
  [#58](https://github.com/ragibkl/adblock-dns-server/issues/58), open for
  nearly two years).
- Daily 2-minute drops traced to the hourly compile: a failed fetch of the
  config made the program panic and the container restart. Some sources were
  also flaky, so the list changed massively between runs, which made reloads
  slow ([#172](https://github.com/ragibkl/adblock-dns-server/issues/172)).
- Certificates weren't reloaded after renewal, so DoH/DoT would have broken
  every 3 months. You'd been restarting servers by hand monthly without
  realising that was what kept them working
  ([#148](https://github.com/ragibkl/adblock-dns-server/issues/148)).
- Now: the new blocklist is built alongside the old one and swapped in
  atomically, and certificates are handled in-process by `dnsdist-acme`.

**Your words:** What's the general lesson? Maybe that the risky part of a
service is the code that changes it, not the code that serves it.

## Lesson: users shape it, and sometimes you say no

- SafeSearch for Google and Bing was added at a user's request in 2020
  ([#23](https://github.com/ragibkl/adblock-dns-server/issues/23)).
- Tomatoide tuned much of the list over the years, including removing an
  aggressive list that broke Microsoft sign-in
  ([#72](https://github.com/ragibkl/adblock-dns-server/issues/72)).
- A whitelist source was letting Google ads through, so some domains are now
  force-blocked above the whitelist
  ([#116](https://github.com/ragibkl/adblock-dns-server/issues/116)).
- Said no to a lighter, ads-only server because it would double the cost
  ([#211](https://github.com/ragibkl/adblock-dns-server/issues/211)), and to
  unblocking Google Ads, because users chose the service expecting them blocked
  ([#214](https://github.com/ragibkl/adblock-dns-server/issues/214)).

**Your words:** How do you decide what to say yes to? How did it feel to say
no to people who clearly liked the service?

## Lesson: privacy is a set of trade-offs you pick

- The early servers forwarded lookups to Google and Cloudflare. A user in
  France asked for a French resolver instead
  ([#57](https://github.com/ragibkl/adblock-dns-server/issues/57)).
- Logs are kept for 10 minutes and only visible to the IP that made the
  lookups. You wanted none, but without logs nobody can debug a broken app on
  a phone ([#158](https://github.com/ragibkl/adblock-dns-server/issues/158)).
- March 2024: stopped forwarding and resolved everything locally with BIND
  ([#200](https://github.com/ragibkl/adblock-dns-server/issues/200)).
- 2026: moved to Unbound after BIND refused a malformed answer from
  dnsleaktest.com's own nameservers, which Unbound tolerates
  ([#218](https://github.com/ragibkl/adblock-dns-server/issues/218)).

**Your words:** Where did you draw the line, and why there?

## Lesson: monitoring has to test what users actually do

- Uptime Kuma couldn't check DoH against current dnsdist, which only speaks
  RFC 8484 over HTTP/2, and it had no real DoT check. So you wrote
  [dns-monitor](https://github.com/ragibkl/dns-monitor).
- A single failed probe used to raise an alert. The three alerts on
  4 September 2026 were each one failed check that passed on the next round,
  so it now retries once before reporting.
- Public status page on Gatus: [status.bancuh.com](https://status.bancuh.com).

## What I'd do differently

**Your words:** Looking back over nine years, what would you tell yourself in
2017?
