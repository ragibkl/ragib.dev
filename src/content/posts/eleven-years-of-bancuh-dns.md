---
title: "Eleven years of running a free DNS service"
description: "Looking back at Bancuh DNS after eleven years: what it costs, what it gave me, the promise I didn't keep, and what I'd tell myself in 2015."
date: 2026-09-30T11:10:00Z
draft: false
tags: [dns, bancuh-dns, self-hosting]
---

*This is part eight, and the last part, of the Bancuh DNS story.
[Part one](/writing/how-bancuh-dns-started/) starts with a Raspberry Pi in
2015.*

This week I brought every Bancuh DNS server up to date, one at a time.

Some of them needed it badly. The two servers in Singapore were still on
Ubuntu 16.04, and had been running since November 2017. They're the same two
servers I brought back after the
[user in Vietnam](/writing/the-user-who-wouldnt-let-me-turn-it-off/) wouldn't
let me turn the service off. The servers in Tokyo and Dallas were on a version
of Alpine Linux that had been out of support for almost a year. And on one of
the Tokyo servers, I found that Docker had never been set to start on boot. I'd
started it by hand when I built the server, about a thousand days earlier, and
it had simply never been restarted since. If that server had ever rebooted,
it would have come back without its DNS.

Two days and a lot of care later, all seven are on current systems. And the
thing that struck me most wasn't what was broken. It was how little had gone
wrong while I wasn't looking. Despite everything in the last seven posts,
Bancuh DNS mostly just runs.

It's been eleven years since the Raspberry Pi. This is a look back at the
whole thing.

## Where it is now

Bancuh DNS today is seven small servers in four places: two in Singapore, two
in Tokyo, two in Paris and one in Dallas. Each one blocks about five million
domains, answers plain DNS, DNS-over-TLS and DNS-over-HTTPS, and resolves
everything itself. Most of them have 1 GB of memory, and use less than half
of it.

It costs me about USD 56 a month: USD 13 for Singapore, USD 16 for Tokyo and
Dallas, about USD 26 for Paris, and the domain. That's a bit over USD 650 a
year. A third of the Paris bill is just the two IPv4 addresses.

I don't know how many people use it. There are no accounts, and I've never
tried to count. My guess is not many. But some do, and a few of them have been
here for years.

Most months, I don't touch it. The servers run well on their own, with
very little attention. The work comes in bursts, when I change something
properly: a rewrite, a new front end, or a week like this one.

## What it gave me

What do I get out of it? In money or recognition, nothing. I keep it running because people depend on it.

That's not the whole truth, though. Bancuh DNS is where I learned
[Rust](/writing/learning-rust-for-a-blocklist-compiler/), which became the
language I use for almost everything I build. It taught me how DNS actually
works, from recursion to certificates. It taught me most of what I know about
running something for other people. And it's on my own phone: I use its
DNS-over-TLS through Android's Private DNS setting every day.

## What the eleven years taught me

Looking back over the series, a few things come up again and again.

Users kept it alive, and shaped it. The service exists because a stranger
tracked me down on Facebook, and most of what it does started as someone
asking for it.

[Most of my outages were my own updates](/writing/what-self-updating-servers-broke/).
The code that changes a service is riskier than the code that runs it.

[Privacy isn't something you get once](/writing/the-leak-test-that-kept-me-honest/).
I had it, lost it in a rewrite, and needed users with a leak test to make me
earn it back.

[Some things can't be taken back](/writing/users-asked-for-encrypted-dns/).
Once people have typed a server's name into their phones, that name has to
keep working.

And small servers shaped the engineering. Many of the big changes, from
capping BIND's cache and adding swap to
[replacing BIND altogether](/writing/replacing-bind-with-my-own-dns-server/),
came from trying to fit the service into less memory and less money.

## The promise I didn't keep

In 2015, when I first offered the service to strangers, I wrote:

> I won't block download sites, torrents, or do any kind of censorship. For the
> moment, I am sticking to adservers only.

Bancuh DNS today is a strict family filter. It blocks ads and trackers, but
also adult sites, gambling, VPNs, other public DNS services, and since
December 2024, torrent sites and trackers. I promised in the
[first post](/writing/how-bancuh-dns-started/) to explain how that happened.

The honest answer is trust. I was focused on the engineering, and I had
neither the time nor the knowledge to build a good blocklist. Tomatoide did.
Tomatoide started by opening issues and pull requests to tune the lists, and
at some point I simply gave them push access. Today, Tomatoide has made more
changes to Bancuh's blocklist than I have. The list drifted from "ads only"
towards a family filter one reasonable request at a time, and I let it,
because I trusted the person doing it.

It did mean breaking a promise I'd made in public, even if I'd only made it
"for the moment". But trusting Tomatoide, and the many others who opened
issues to report a broken site or suggest a list, made Bancuh far better than
anything I'd have built on my own. And the
[filtering page](https://bancuh.com/filtering/) says plainly what it blocks, so
nobody has to take my old promise on trust.

## Saying no

Over the years I've said no to some things users clearly wanted. A lighter
server that only blocked ads
([#211](https://github.com/ragibkl/adblock-dns-server/issues/211)). Unblocking
Google Ads and Analytics because they broke some sites
([#214](https://github.com/ragibkl/adblock-dns-server/issues/214)).

The reasons were rarely about the idea itself. Some features aren't worth the
cost when there's a good workaround: if Bancuh is too strict for one device,
you can point that device somewhere else. Some just can't be engineered well
with what I have. And some I couldn't maintain. A second, lighter list would
need someone to curate it the way Tomatoide curates this one, and I don't know
how to do that. In #211 I said I'd revisit it if I ever became significantly
richer. That hasn't happened yet.

For #214, the reason was simpler: people chose Bancuh expecting it to block
ads and analytics, and I didn't want to change that under them.

## The last year

Most of the recent posts end with me working on something with
[Claude Code](https://claude.com/claude-code): the leak test bug, the review
of the front end, and this week's updates across all seven servers. That's not
a coincidence.

For most of its life, Bancuh DNS was bigger than I could properly look after
in the time I had. I kept it running, but I rarely looked underneath. Working
with Claude Code changed that. I can make bigger changes, more safely and more
smoothly, keep everything up to date, and actually fix the things I used to
work around. It's what makes the service feel sustainable to me now. I love
what it lets me do.

## What happens next

I'll keep it running for as long as I can. I can afford it now. If money ever
gets tight, I might have to ask for help. Two people have already suggested
a "buy me a coffee" link for [simplesolat](/writing/why-i-built-a-prayer-times-app/),
my prayer times app, and the same idea would apply here. Asking for money for
a free service still feels wrong to me, but maybe they have a point. I haven't
decided.

There's also a known problem left to fix: after every restart, a server
answers for about a minute without its blocklist while it compiles the first
one ([#220](https://github.com/ragibkl/adblock-dns-server/issues/220)). There
always seems to be one more.

## A note to 2015

If I could send one message back to the version of me with a Raspberry Pi and
a borrowed ad list, it would be short.

Plan the architecture before strangers depend on it. Think about how much
memory and CPU each piece will need when the list is a hundred times bigger,
because it will be. BIND was never meant to hold millions of blocked domains,
and I paid for that for years in bigger servers and swap. Maybe something
lighter, like dnsmasq, would have been cheaper. I'll never know.

And good luck. You'll need it.
