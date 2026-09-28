---
title: "The user who wouldn't let me turn it off"
description: "In 2017 I shut down my free adblock DNS to save money. A user in Vietnam tracked me down on Facebook, and over the next few years, his requests shaped much of what Bancuh DNS became."
date: 2026-09-28T12:00:00Z
draft: false
tags: [dns, bancuh-dns, self-hosting]
---

*This is part two of the Bancuh DNS story. [Part one](/writing/how-bancuh-dns-started/)
covers how it started, on a Raspberry Pi in 2015.*

By early 2017, my ad-blocking DNS had settled into a quiet routine. It ran on
two small DigitalOcean servers in Singapore, the closest region to me in
Malaysia, and I finally tidied the code up and
[put it on GitHub](https://github.com/ragibkl/adblock-dns-server). It was
simple: BIND answered DNS queries and forwarded ordinary ones to Google. A
Python script downloaded a few blocklists, around 50,000 ad domains in total,
and told BIND to point all of them at a tiny nginx server that answered every
request with nothing at all. The whole thing ran as two Docker containers.

As far as I knew, the people using it were me, my family, and a few friends
whose routers I'd changed. Each server cost about USD 5 a month. That doesn't
sound like much, but I wasn't earning much at the time, and I was feeling it.
Paying for two servers that seemed to serve only a handful of people was hard
to justify. So sometime in 2017, I turned them off.

## Saying sorry

It didn't feel right to disappear quietly, so in November 2017 I wrote a blog
post about it. Part of it was an apology:

> If you've been using my DNS servers until recently, you'll know that I took
> down my servers. It was no longer financially viable for me to keep them
> running. Yeah, if you were using, I kinda screwed you over. Sorry about that.

The rest of the post was the next best thing I could offer: a guide to running
your own. Back in 2016, I'd promised to write one someday. Now it was the
honest answer. If you don't want to depend on a stranger's server, and that
stranger has just proved he might switch it off, run it yourself. I ended it
with:

> Spin up some servers, and go help others block ads.

I thought that was the end of it.

## The message

Then a message arrived on Facebook, from someone I'd never met. He was in
Vietnam, he'd been using my DNS, and it had stopped working. He'd gone looking
for the person behind it, and found me. Could I please turn it back on?

Honestly, I felt guilty. And I was surprised: someone had cared enough about
this little side project to track me down on Facebook. I pointed him to other
adblock DNS services that would serve him better than I could. He wanted mine.

By then I'd moved to a better-paying job, and USD 10 a month no longer hurt.
Between that and his persistence, I brought it back, on two DigitalOcean
servers in Singapore again. Those
two servers are still running today, as `sg-dns1` and `sg-dns2`.

## A persistent user

That turned out to be the start of a long conversation.

He asked for malware sites to be blocked, so I added lists for that. By the
middle of 2018, the service's own page promised a "Safe and Ad-free browsing
experience". It blocked malware, softly blocked adult sites, and told parents
that on a home router "we can make the internet a little safer for your
kids". Two years earlier I'd promised to
stick to ad servers only. It turned out that what people wanted from an ad
blocker was a safer internet, and I'd drifted there one request at a time.

In early 2020 his requests moved to GitHub, where he opened issue after issue.
He asked for SafeSearch to be forced on Google and Bing
([#23](https://github.com/ragibkl/adblock-dns-server/issues/23)), so I built it.
He asked for a "blocked" page with categories, like the commercial filters have
([#31](https://github.com/ragibkl/adblock-dns-server/issues/31)). He wanted the
kind of customisation that paid services like NextDNS offer. Some of it I
built. Some of it was simply beyond what one person could run for free, and I
had to say no.

## Too far from Vietnam

The trickiest request was about speed. He watched live-stream sites, and
through my DNS they loaded painfully slowly
([#32](https://github.com/ragibkl/adblock-dns-server/issues/32),
[#46](https://github.com/ragibkl/adblock-dns-server/issues/46)). Through
Google's DNS, they were fine.

It took me a while to understand why. Big sites use content delivery networks,
with copies of their servers all over the world, and they pick which copy to
send you to based on where your DNS lookup comes from. With my DNS, his
lookups came from Singapore, so he was sent to servers near Singapore, not
near him. The DNS answer itself was fast. It just pointed him somewhere far
away.

The fix was to put a DNS server closer to him. I tried hosting providers in
Vietnam, but the ones I found didn't allow the ports a DNS server needs. So in
April 2020 I set up a test server in Tokyo and asked him to try it
([#53](https://github.com/ragibkl/adblock-dns-server/issues/53)). His verdict
came back quickly: fast. That test server is still running, as `jp-dns1`.

Looking back, I can laugh about it. A user nagged me until I gave in, more than
once. But a surprising amount of Bancuh DNS exists because of him: the
malware blocking, SafeSearch, and the servers in Tokyo.

## Not just one user

He wasn't the only one, though he was the loudest. In September 2018, the first
thank-you arrived as a
[GitHub issue](https://github.com/ragibkl/adblock-dns-server/issues/4) from
someone I didn't know. In August 2019, a user in France
[wrote](https://github.com/ragibkl/adblock-dns-server/issues/6) that he'd just
discovered the DNS and was "quite surprised at how fast it is", then sent me a
list of blocklists to add. There were a few users in France by then, so when I
set up the Tokyo server, I also set up one in Paris
([#52](https://github.com/ragibkl/adblock-dns-server/issues/52)). Later that
year another user in France, [Tomatoide](https://github.com/Tomatoide), started
reporting broken sites and suggesting lists, and went on to shape the blocklist
for years.

I still don't know how most of them found it.

## What changed

In 2015 I built this to block banner ads on my family's phones. By 2020 it had
servers in three countries, a blocklist shaped by people I'd never met, and
features I would never have thought to build myself. I hadn't planned any of
that. I mostly just said yes, one request at a time, and sometimes no.

What I took from those years is that I was never really the one deciding what
Bancuh DNS was for. The users were, one issue at a time. The part I could
control was how honest I was about what it could and couldn't be.

Next in the series: what all those new lists and servers did to the code
underneath, and why I rewrote the blocklist compiler in Rust.
