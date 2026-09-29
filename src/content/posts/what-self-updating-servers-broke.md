---
title: "Most of my outages were my own updates"
description: "Between 2020 and 2023, almost every Bancuh DNS outage came from the code that updated the servers, not the code that served DNS. A k3s experiment, self-updating servers, the OOM killer, a growing list on a small budget, and a certificate bug my own habits were hiding."
date: 2026-09-29
draft: false
tags: [dns, bancuh-dns, operations, bind]
---

*This is part four of the Bancuh DNS story. [Part three](/writing/learning-rust-for-a-blocklist-compiler/)
ended with every server compiling its own blocklist when it started up.*

Looking back over the GitHub issues from these years, a pattern jumps out.
When Bancuh DNS went down, it was almost never because answering DNS queries
was hard. It was because of something I did to change the servers: an update,
a deploy, a new way of compiling the list. Serving DNS was the easy part.
Changing it safely was not.

## Two minutes of silence

In 2020, every update to the blocklist meant restarting the DNS server with
the new list, and that took two to three minutes. For those minutes, anyone
using that server had no internet.

A user in France noticed. At their request, I'd switched the French server to
forward lookups to a French DNS provider, and soon after they reported what
they called cuts. I had to explain that it wasn't the new provider. It was me:
my own update process took the server down every time I changed the list. In September 2020 I opened an
[issue](https://github.com/ragibkl/adblock-dns-server/issues/58) to fix it.
It stayed open for almost two years.

## Trying Kubernetes too early

My first attempt, in early 2021, was ambitious. I'd been reading about
[k3s](https://k3s.io), a small Kubernetes distribution, and thought it could
replace Docker Compose and give me rolling updates for free. I tried it on the
two servers in France, which I'd just doubled up so there was a spare.

It didn't go well. IPv6 stopped working properly, and the query logs page broke
in the new setup. The French users who relied on those logs noticed within
weeks. In March 2021, I reverted one server and wrote:

> It seems that k3s setup does not work as well as I hoped.

I apologised for the slow progress too. Things were busy at work. In
hindsight, servers that people relied on every day weren't the place to learn
Kubernetes.

## A quieter change

Not everything in 2021 was about updates. In May, I made a change for
privacy. Until then, the servers forwarded every lookup that wasn't blocked
to public DNS servers run by big companies, so they saw everything my users
looked up. I switched the servers to resolve names themselves, starting from
the root DNS servers, so nobody else saw my users' queries.

I tested it with [dnsleaktest.com](https://www.dnsleaktest.com), which lists
every DNS server that took part in your lookups. The only servers it found
were DigitalOcean servers in Singapore: mine. Five years later, that same test site
would help uncover a very different bug, but that's a story for later in this
series.

## Self-updating, finally

The downtime was eventually solved not by me, but by a suggestion from
[Tomatoide](https://github.com/Tomatoide): let each server update itself in
the background. Instead of stopping the DNS server to load a new list, a
server could download the configuration, compile the new list, and load it
without stopping. By July 2022, every server ran that way, and the two-minute
silences were gone. I closed the issue with a thank-you for the idea.

Mostly gone, anyway. Loading a new list no longer meant restarting BIND, but
it still meant BIND *reloading* it, and reloading a zone of millions of
entries made it stumble. For a short while after each update, queries could
still go unanswered.

## Then the servers started dying

Within a month, a user reported that the Tokyo server kept crashing, and so did
both servers in France
([#154](https://github.com/ragibkl/adblock-dns-server/issues/154)).

It took a few days of reading logs to understand. The servers were running out
of memory. When that happens, Linux's OOM killer picks a process to kill to
free some up, and it picked BIND, the DNS server itself. Worse, the script that
ran BIND alongside the self-updater didn't notice. The container stayed up,
Docker thought everything was fine, and there was no DNS server inside it. The
server looked healthy and answered nothing.

This was the part of running Bancuh DNS that felt like real pressure. People
depended on it, and I wanted it to stay up. But the list kept growing. Much of
that was Tomatoide's careful work adding good sources, and every new source cost
memory, and memory cost money. In early 2020, my servers had 2 GB of memory and
cost USD 10 a month each. By 2022 they had 4 GB, and the Tokyo server had been
bumped all the way to 8 GB, and it was *still* running out.

I capped how much BIND was allowed to use for its cache, fixed the startup
script so that if either process died the whole container restarted cleanly,
and watched the memory for a week. It held. By September, the Tokyo server was
back to 4 GB.

## The compiler was the other half

BIND wasn't the only thing hungry for memory. By late 2022, the blocklist had
grown to about 2.5 million domains, and compiling it used almost a gigabyte of
memory on its own
([#162](https://github.com/ragibkl/adblock-dns-server/issues/162)). On a
server already running BIND, that was often enough to trigger the OOM killer.

So in December 2022, I rebuilt the compiler from scratch as a standalone tool,
[adblock-list-compiler](https://github.com/ragibkl/adblock-list-compiler), or
`ablc`, with memory use in mind from the start. There's an irony in it. Two
years earlier, I'd rewritten the compiler in Rust to fetch every source at
once. The new one deliberately went back to fetching them one at a time,
slower, because doing it all at once cost too much memory
([#167](https://github.com/ragibkl/adblock-dns-server/issues/167)). It used
about 220 MB where the old one used about 600 MB. On the first server I tried it
on, total memory use roughly halved, and I briefly dreamed of going back to
2 GB servers.

That fixed the compile step. It didn't fix the reload: once the new list was
ready, BIND still had to load millions of entries, and that still caused short
cuts.

A month later, I noticed that my own connection dropped for about two minutes
every day ([#172](https://github.com/ragibkl/adblock-dns-server/issues/172)).
This time the culprit was the network. Each hour, the server re-fetched its
configuration and some of the blocklist sources, and every so often one of
those downloads failed. When it did, the compiler crashed, and took the
container down with it. A few of the sources were also flaky, returning very
different lists from one hour to the next, which made each reload slower and
more disruptive than it needed to be. The fix was unglamorous: retry failed
downloads, and switch to more stable sources.

## Holding it together with swap

The new compiler bought some time, but the list kept growing. In August 2023,
encrypted DNS started failing on and off
([#186](https://github.com/ragibkl/adblock-dns-server/issues/186)). It was
memory again, failing in two different ways: in France, BIND got stuck and
stopped answering, and in Singapore, the compiler itself was killed before it
could finish.

Tomatoide offered to cut down the lists, removing ones already covered by
bigger lists. I appreciated it, but I didn't think duplicates were the real
problem. The real problem was the size of the final list, and my budget. As I
put it at the time:

> To be frank though, the reason we have this issue, is because I only created
> servers with 4GB of RAM. If I upgraded all the servers to 8GB, the problem
> will go away, but it will cost me double the money every month!

So I did the cheapest thing that might work: I added swap to every server,
disk space the system could use as overflow memory. The Singapore and Tokyo
servers each got 4 GB of it. A day later, everything was green again. It wasn't
elegant, but it held.

It held by leaning on that swap harder and harder. By December 2023, one of the
Singapore servers was using 3 GB of its 4 GB of memory plus another 3 GB of
swap, and BIND alone was holding 2.8 GB of it
([#191](https://github.com/ragibkl/adblock-dns-server/issues/191)).

## The bug my habits were hiding

My favourite bug from this period is one that never actually broke anything.

In July 2022, I noticed something odd in the logs: the TLS certificates used
for DNS-over-HTTPS and DNS-over-TLS weren't actually being updated
([#148](https://github.com/ragibkl/adblock-dns-server/issues/148)).
Certificates from Let's Encrypt last three months. So by rights, encrypted DNS
should have stopped working on every server after three months.

It never had, because I restarted the servers by hand every month or two
anyway, and each restart fetched a fresh certificate. My maintenance habit had
been quietly covering for a bug I didn't know existed. If I'd ever stopped
doing it, the bug would have shown up.

## What I took from it

If I had to sum up these years, it would be this: the risky part of a service
is the code that changes it, not the code that runs it. Almost every outage
came from updates, deploys, restarts and background jobs, and almost none from
answering DNS queries.

I'd love to say I learned that lesson once and for all. I didn't. Even now,
after a restart, a Bancuh DNS server briefly answers without its blocklist for
a little over a minute, until the first compile finishes. It's on my list.

The bigger problem of those years, though, was BIND itself: a general-purpose
DNS server doing a job it wasn't designed for, and using more memory than my
small servers could spare, and stumbling every time it reloaded the list.
Swap kept it alive, but it wasn't a fix. The fix, at the end of 2023, was to
stop using BIND for blocking altogether and write my own DNS server. It did
the same job in under 500 MB, and instead of reloading a new list, it swapped
it in while still answering queries. That's the next story.
