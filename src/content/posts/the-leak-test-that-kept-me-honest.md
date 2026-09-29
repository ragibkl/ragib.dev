---
title: "The leak test that kept me honest"
description: "How Bancuh DNS went from passing every lookup to Google, to resolving everything itself, losing that in a rewrite, and getting it back. Nudged at every step by users running DNS leak tests."
date: 2026-09-29T18:00:00Z
draft: true
tags: [dns, bancuh-dns, privacy, unbound, bind]
---

*This is part six of the Bancuh DNS story. [Part five](/writing/replacing-bind-with-my-own-dns-server/)
is about replacing BIND with my own DNS server, and the one thing that cost me.*

Blocking ads is only half of what an ad-blocking DNS server does. Most lookups
aren't for ad servers at all. They're for the websites people actually want,
and the server has to find the right answer for every one of them.

## Two ways to answer a question

The answer to "where is `example.com`?" lives with the DNS servers that belong
to `example.com`. Every lookup has to end with someone asking them. A DNS
server like mine can get there in two ways.

**Forwarding** is asking someone else to do it. My server passes the question
to a big public resolver, like Google's `8.8.8.8`, and relays the answer back.
It's simple, fast, and reliable. But that company sees every lookup my users
make.

**Recursion** is doing it yourself. My server starts at the top of the DNS
tree. It asks the root servers who handles `.com`, asks the `.com` servers who
handles `example.com`, and then asks `example.com`'s own servers for the
address. It's more work, but no single company in the middle sees the whole
list of what my users look up.

For most of its first six years, Bancuh DNS forwarded everything, mostly to
Google.
I didn't think much about it. The users did.

## "Bancuh has DNS leaks?"

In June 2020, a user in France opened an issue with that title
([#57](https://github.com/ragibkl/adblock-dns-server/issues/57)). They had run
a DNS leak test, a website that shows which DNS servers took part in your
lookups, and found their lookups going through my server on to Google and
Cloudflare. They asked if the French server could use a privacy-focused French
provider instead.

I did, and explained how forwarding worked. I also wrote down, for the first
time, that I might stop forwarding altogether one day and resolve everything
myself. And I reminded them of the uncomfortable part: whatever I changed,
they still had to trust me.

A few months later, while I was dealing with an unstable French server, the
same user caught me again. They'd run the leak test once more and noticed
that Google was back
([#63](https://github.com/ragibkl/adblock-dns-server/issues/63)). Nobody had
to tell them. The leak test did.

## Doing it myself

In March 2021 I opened an issue of my own: stop forwarding, and resolve from
the root servers directly, so that users' lookups weren't handed to big
companies ([#92](https://github.com/ragibkl/adblock-dns-server/issues/92)).
BIND could already do recursion, so the change itself was small: switch off
the forwarders. In May, it went live, and I checked it the way my users had
been checking me. I ran a leak test. The only servers it found were mine.

## Losing it in the rewrite

At the end of 2023, I replaced BIND with a DNS server I wrote myself. It used a
fraction of the memory, but it didn't know how to do recursion. It could only
forward. So for a while, Bancuh DNS quietly went back to handing lookups to
public resolvers, and most of them to Google.

It didn't stay quiet for long. In January 2024, Tomatoide asked
([#195](https://github.com/ragibkl/adblock-dns-server/issues/195)):

> so until we get handling of domain resolution recursively, can we change to
> something other than google?

I switched every server to another public resolver, by hand, logging into each
one. I told them there was no way for them to check I'd done it correctly.
They pointed out that there was: the leak test. Around the same time, another
user found a website that the forwarders simply couldn't resolve
([#193](https://github.com/ragibkl/adblock-dns-server/issues/193)), and I wrote
that it looked like I'd have to hurry up with recursion.

## Getting it back, with BIND

My new server was built to filter, not to resolve. Rather than teach it
recursion, I gave it a partner: BIND again, but only as a resolver, sitting
behind my server. My server decides what to block, and passes everything else
to BIND, which does the lookup from the root.

My first try, in March 2024, ran BIND as a separate container, which meant
opening more ports on each server than I liked. A day later I found a simpler
arrangement: bundle BIND inside the same image as my server, listening only
locally. Two days after that, every server was resolving for itself again
([#200](https://github.com/ragibkl/adblock-dns-server/issues/200)).

Bundling them meant two programs in one container, and I'd been burned by that
before. Back when BIND did the blocking, a small shell script started BIND and
the list updater side by side, then waited for *both* of them to finish. So
when BIND was killed in 2022, the updater carried on, and the container kept
running with no DNS server inside it. I patched it with a one-line change,
telling the script to exit as soon as *either* program stopped, so Docker
would restart everything.

This time, I made my Rust program the one in charge. It
starts BIND itself, as a child process. When Docker asks the container to stop,
my program shuts BIND down with it. And if BIND ever dies on its own, my program
notices, shuts itself down too, and lets Docker restart the whole container
cleanly. In effect, my DNS server became a tiny service manager for its own
resolver.

## The leak test that wouldn't load

In August 2026, Tomatoide opened an issue I didn't expect
([#218](https://github.com/ragibkl/adblock-dns-server/issues/218)). They'd tried
to run a DNS leak test, on dnsleaktest.com, the same site I'd used in 2021 to
prove my servers resolved for themselves. It wouldn't load. The logs showed
the lookup, with an empty answer, and no sign that it had been blocked.

I worked through this one with [Claude Code](https://claude.com/claude-code),
and it turned out to be two problems stacked on top of each other.

**The first wasn't mine.** dnsleaktest.com's own DNS servers send a slightly
malformed reply: a record that's supposed to be addressed to the root of DNS is
addressed to the domain instead. Most big public resolvers shrug and use the
answer anyway. BIND, being strict, rejects it outright, so the lookup failed.

**The second was mine.** When a lookup failed, my server was supposed to say so
(`SERVFAIL`), so that the user's device would know to try a backup DNS server.
Instead, it said "success, no records". So devices didn't fail over. They just
kept retrying and hanging, and my logs showed a blank answer rather than an
error. Worse, the same bug meant that for about 30 seconds after any server
restart, while the resolver warmed up, *any* domain could come back blank.
This had probably been quietly affecting other lookups too.

The fixes were to return real errors, and to replace BIND with
[Unbound](https://nlnetlabs.nl/projects/unbound/), a resolver that tolerates
dnsleaktest.com's malformed reply, starts faster, and is what most people
running their own recursive resolver already use. One detail almost slipped
through: BIND checks DNSSEC signatures by default, and Unbound doesn't unless
you configure it to. So the switch had to include that too, and a test that a
deliberately broken domain was still rejected.

There was an easier fix on the table: send dnsleaktest.com's lookups to a public
resolver like Cloudflare, which accepts the malformed reply. I didn't. The
whole point of a leak test is to show which servers handled your lookup. If I'd
forwarded it, the test would have "passed" by showing exactly the leak it
exists to catch.

## Looking back

Three times, users pushed this forward, and a leak test was at the centre each
time: in 2020, when someone noticed their lookups going to Google; in 2024,
when Tomatoide asked me to stop using Google until I had recursion back, and
then checked my change with a leak test; and in 2026, when the leak test
itself wouldn't load and uncovered a bug I'd had for years.

I did the work each time. But I'm not sure I'd have done it as soon, or as
carefully, if my users hadn't kept checking. A leak test is a small thing. It
turned out to be a very good way for people to hold me to what I'd promised.

I also learned that privacy isn't a switch you flip once. I had it in 2021, lost
it in a rewrite two years later without thinking much about it, and needed a
user to remind me. A rewrite is a good time to ask not just "does it still
work?", but "does it still keep my promises?"
