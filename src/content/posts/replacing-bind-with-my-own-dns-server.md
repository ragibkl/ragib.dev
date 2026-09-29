---
title: "Replacing BIND with my own DNS server"
description: "By the end of 2023, BIND was using 2.8 GB of memory to block ads on a 4 GB server. So I wrote a small DNS server in Rust that does the same job in about 100 MB."
date: 2026-09-29T12:00:00Z
draft: true
tags: [rust, dns, bancuh-dns]
---

*This is part five of the Bancuh DNS story. [Part four](/writing/what-self-updating-servers-broke/)
is about the years of outages, memory limits and swap that led here.*

In December 2023, I logged into one of the Singapore servers and looked at the
memory. The server had 4 GB. It was using 3 GB of that, plus another 3 GB of
swap. And one process was holding 2.8 GB on its own: BIND.

BIND is one of the most widely used DNS servers in the world. It can do almost
anything DNS can do: host domains, resolve names, sign records, transfer zones
between servers. I was using it to do something much narrower, and paying for
all of it in memory.

## What Bancuh DNS actually needs

When I wrote down what the DNS server actually had to do for Bancuh DNS, the
list was short
([#191](https://github.com/ragibkl/adblock-dns-server/issues/191)):

- block every domain on the blocklist,
- except the ones on the allowlist,
- rewrite a handful of domains to others, for SafeSearch,
- support wildcard entries like `*.example.com`, which block a domain and
  everything under it,
- and look up everything else.

That's it. The hard part isn't DNS itself. It's the blocklist: millions of
domains, which BIND loaded into memory as a giant zone, and then had to reload
in full every time the list changed.

By then I'd written a blocklist compiler in Rust twice, and I knew the problem
well. So I wondered: how hard would it be to write a DNS server that did only
those three things?

## Four days

It turned out I could get something working very quickly. I started on
18 December 2023, and the git history of
[bancuh-dns](https://github.com/ragibkl/bancuh-dns) reads like a checklist: a
DNS server that answers, a store for the blocked domains, a resolver that
passes other lookups through, the blocklist compiler plugged in, then SafeSearch
rewrites. On 22 December, it was running on both Singapore servers and the
first Tokyo server.

I didn't know how to write a DNS listener from scratch, and I didn't have to.
I found [Hickory DNS](https://github.com/hickory-dns/hickory-dns), a Rust DNS
library that felt like Axum, the web framework I already knew, but for DNS:
it handles the protocol, and I write a handler that decides the answer. That
let me spend my time on the part that was actually mine.

Two decisions made most of the difference.

**Keep the list on disk.** Instead of holding millions of domains in memory, the
new server keeps them in an embedded database on disk. My first try was SQLite,
but I couldn't get the swap (below) to work correctly with it. I'd seen
[RocksDB](https://rocksdb.org) mentioned online, so I gave it a go, and it fit
much better. Every check the server makes is a simple lookup of a key, a
domain name, which is exactly what RocksDB is built for. When it needs to check
a domain, it asks the database, and the operating system keeps the frequently
used parts cached in memory on its own. Most lookups are for a small set of
popular domains, so the part of the list that actually needs to be in memory at
any moment is tiny.

**Build the new list next to the old one, then swap.** Once a day, the server
compiles a fresh copy of the list into a new database in the background, while
the old one keeps answering queries. When the new one is ready, it swaps it in
all at once. There's no reload, and no moment where BIND is chewing through
millions of entries and dropping queries. With RocksDB, this worked the first
time.

## Rolling it out

A couple of days later, I moved the servers in France over too, and their IPv6
addresses changed in the process. I also added a second Tokyo server, as I
wrote at the time, "since it's cheaper now".

Then Tomatoide reported something odd: some blocked sites weren't blocked.
Their logs showed the server doing what I'd designed it to do. The new server
blocked domains by answering that the domain doesn't exist (`NXDOMAIN`), which
seemed like the cleanest way to do it. But on their connection, ads still appeared over ordinary DNS,
while DNS-over-HTTPS worked fine. My best guess was that something between them
and my server, probably their internet provider, was replacing "domain doesn't
exist" answers with its own. The fix was to go back to what BIND had always
done: answer blocked domains with `0.0.0.0`, an address that leads nowhere. I
changed it and deployed it to France the same day, and it worked. The
cleanest answer on paper isn't much use if the network in between doesn't
cooperate.

## What I gave up

Rewriting BIND out of the picture had a cost I'd half-forgotten. Since 2021,
BIND had been doing more than blocking. It was also resolving every other
lookup itself, starting from the root DNS servers, so my users' queries
didn't go through any big company. My new server didn't know how to do that.
It could only pass lookups on to another DNS server, so for a few months,
Bancuh DNS went back to forwarding queries to public resolvers.

Getting that back properly took two more attempts, and one of them was BIND
again. That's the next part of this story.

## The numbers

At the end of 2023, BIND was holding 2.8 GB. Today, the Rust server on each
Bancuh DNS machine uses somewhere between 85 and 130 MB. Most of the servers
now have just 1 GB of memory in total, less than they had in 2020, and each
whole server, including the resolver and the encrypted DNS front end, uses
under 500 MB.

Much later, I compared it with other DNS filters, using the full Bancuh list of
7.8 million entries on a single-CPU machine
([COMPARISON.md](https://github.com/ragibkl/bancuh-dns/blob/master/COMPARISON.md)).
The engines that keep the whole list in memory needed 600 MB to a gigabyte.
bancuh-dns needed about 40 MB. That isn't because it's clever. Pi-hole, which
also keeps its list on disk, needed even less, though it can't block wildcard
domains, which make up about 40% of the list. When I wrote bancuh-dns, I
didn't know whether other filters could handle wildcards at all. It turned out
some can, in their own ways, but not all. It's a narrow tool, built for
exactly one job, on exactly one kind of cheap server.

It isn't finished, either. On a single-CPU server, compiling the new list still
slows lookups for a couple of minutes each day, and after a restart there's a
short window before the first list is ready. Both are on my list.

## Looking back

For years I'd treated BIND as a given, and spent my time working around it:
capping its cache, adding swap, paying for bigger servers. What finally helped
wasn't a better way to run BIND. It was writing down what I actually needed,
and noticing how little of BIND that was.

The four days only worked because of the years before them. Three
compilers, two of them in Rust, had taught me exactly how the list worked, and
running the service had taught me exactly where it hurt.
