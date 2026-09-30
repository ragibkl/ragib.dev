---
title: "Users asked for encrypted DNS"
description: "In 2022 a Bancuh DNS user asked for DNS-over-HTTPS. I didn't know how to do it yet. How dnsdist, a logs page built around privacy, and a small Rust front end grew out of that request, and what a proper review found four years later."
date: 2026-09-30T07:45:00Z
draft: false
tags: [dns, bancuh-dns, doh, dot, dnsdist, rust]
---

*This is part seven of the Bancuh DNS story. [Part six](/writing/the-leak-test-that-kept-me-honest/)
is about where the answers come from. This one is about how the questions get
there.*

For its first seven years, Bancuh DNS only spoke plain DNS: unencrypted
queries on port 53, the way DNS has worked since the 1980s. Anyone between you
and the server could read which sites you were looking up, and any network
that wanted to could block or redirect port 53.

By 2022, that was starting to look old-fashioned. Browsers and phones had
learned to send DNS queries encrypted, and most public DNS services supported
it. In January, [Tomatoide](https://github.com/Tomatoide), who had become one
of Bancuh's most helpful users, asked whether Bancuh could too
([#117](https://github.com/ragibkl/adblock-dns-server/issues/117)).

My reply was honest: "Yeah, that would be good to have! I don't know how to
do this yet. If you happen across any docs or guides online, do paste the
links here."

## Why it was worth doing

There are two common ways to encrypt DNS, and each one solves a different
problem.

DNS-over-TLS, or DoT, wraps DNS queries in TLS on its own port, 853. Your
lookups are private between you and the server. It also has one feature that
mattered more to me than anything else: Android supports it directly. Go to
the *Private DNS* setting, type in a server name, and every app on the phone
uses it, on home Wi-Fi and on mobile data alike. No app to install, and nothing
technical to understand. For an ad-blocking service, that was a big deal. Until
then, Bancuh only really worked on networks where you could change the DNS
settings, which usually meant your own home router.

DNS-over-HTTPS, or DoH, sends DNS queries as ordinary HTTPS requests on port
443. That makes it very hard to block. A network can block port 53 or port 853
without anyone noticing much, but if it blocks port 443, nothing on the web
works at all.

So it seemed like an important thing to offer. The question was how.

## dnsdist

A couple of days later, I'd found some notes and guides, and they all pointed
at the same tool: [dnsdist](https://dnsdist.org), a DNS load balancer from the
makers of PowerDNS. It can sit in front of a DNS server and accept queries over
plain DNS, DoT and DoH, then pass them all to the server behind it as plain
DNS. BIND wouldn't need to know anything had changed.

In February 2022 I set up a test server in Paris with dnsdist in front of BIND,
and certbot fetching a certificate from Let's Encrypt, and asked Tomatoide to
try it. "If you have time, you can test the DoT as well. On Android phones,
there is setting for Private DNS…"

I was really happy when DoT worked. It was so easy to try on an Android
phone: type the name into a settings screen, and that was it. That alone made
the whole thing worth it.

It wasn't free, though, and I wrote down the costs in the same comment.
Because every query now arrived at BIND from dnsdist, BIND only ever saw
dnsdist's address, not the user's. That broke the logs page, which showed
people their own recent queries. Port 80 was now needed by certbot. And rate
limiting had to move from BIND to dnsdist.

The logs page mattered, so I rebuilt it before going live. dnsdist can stream
a record of every query it handles, a format called dnstap, and I wrote a small
viewer on top of it. Six days later, Tomatoide checked it: "Nice it works 👍".
It went live on every server at the end of February
([#121](https://github.com/ragibkl/adblock-dns-server/pull/121)).

## A logs page, kept small

The logs page raises an obvious question, and in August 2022 someone asked it
directly: is Bancuh DNS "no logs"
([#158](https://github.com/ragibkl/adblock-dns-server/issues/158))?

Not quite, and I tried to explain why. Ideally I wouldn't keep any logs at all.
But people use Bancuh on phones and in apps, where there are no browser
developer tools, and when a site breaks or an ad gets through, the only way to
see what happened is to look at the queries. Tomatoide and other users use the
page for exactly that, to find what's blocking a broken page or which domain
is serving an ad that got through. I use it too, sometimes.

So I kept it as small as I could. A query is kept for ten minutes, then
thrown away. And you can only see queries from your own IP address: the page
looks at the address you're visiting from and shows only those. The ten
minutes was an arbitrary number, but the principle wasn't: privacy first, and
just enough to debug. The logs started out as a file that was constantly
cleared, and today they live only in memory and are never written to disk.

It isn't perfect. If you're behind a shared address, like a big office
network or a mobile carrier's, the queries you see under "your" address could
be anyone's. But it was the only way I knew to make it useful without making
it a record of everyone.

## Addresses people depend on

In August 2022 Tomatoide came back with two suggestions
([#153](https://github.com/ragibkl/adblock-dns-server/issues/153)). Many apps
expected DoH addresses to end in `/dns-query`. That one turned out to be
supported already. The other was to shorten the server names, from
`fr-dns1.bancuh.com` to `fr1.bancuh.com`.

I said no to that one. I couldn't give a server two names, and people had
already typed the existing names into their phones and routers. If I changed a
name, their DNS would simply stop working, and they wouldn't know why. A name,
once handed out, has to keep working. It's the same rule I ended up with for
[GibTalk's pictures](/writing/where-the-pictures-come-from/).

## A proxy of my own

By the end of 2023, the pieces around dnsdist had piled up. On each server
there was BIND for the answers, dnsdist in front of it, certbot in its own
container fetching certificates, shell scripts to tell dnsdist to reload
them, the dnstap output, and a small Node app for the logs page. They all
worked, more or less, but stringing together a set of seemingly unrelated
programs is painful.

That December I was already rewriting the part that answers DNS, replacing
BIND with [bancuh-dns](/writing/replacing-bind-with-my-own-dns-server/). So I
thought about the whole thing the way I'd think about a web service.
bancuh-dns would be like an API backend: it would do one job, deciding the
answer to each query. Everything that faced the outside world would move into
one front end, like a reverse proxy or an API gateway, the role Caddy or nginx
plays for a website. It would accept plain DNS, DoT and DoH, look after the
certificates, and serve the logs page.

Over New Year, between 30 December 2023 and 2 January 2024, I wrote that front
end in Rust and called it
[dnsdist-acme](https://github.com/ragibkl/dnsdist-acme). It's a single service
that starts dnsdist, runs certbot, reloads the certificates, reads the query
logs, clears them every ten minutes and serves the logs page. The glue that
had lived in shell scripts and a Node app moved into Rust, so there was less
orchestrating separate processes by hand. It still ran a few programs inside,
dnsdist and certbot among them, and I was fine with that. What mattered was
that they belonged together.

I also liked that each half made sense on its own. Someone could put
dnsdist-acme in front of any DNS server to get DoT and DoH, or run bancuh-dns
by itself as a plain filtering server.

It went live on 2 January 2024
([#192](https://github.com/ragibkl/adblock-dns-server/pull/192)). The next day,
a user reported that the logs page had moved. I'd rewritten it in Rust and
forgotten to keep the old path
([#193](https://github.com/ragibkl/adblock-dns-server/issues/193)). Then
IPv4 addresses showed up in an IPv6 disguise, `::ffff:` in front of them, so
nobody's queries matched their own address. Both were fixed within two days,
with the help of the users who reported them.

The logs page kept giving me the most trouble. In August 2024, one Paris
server ran out of disk space, because old logs weren't being cleared the way I
thought they were
([#210](https://github.com/ragibkl/adblock-dns-server/issues/210)). I reworked
how the logs were read and stored, and added the logs page to the status page,
so I'd hear about it before users did.

## Folding it in, and not

In March 2026, I tried to take the same idea one step further. If moving the
glue into Rust had helped, moving everything into Rust should help more. So I
taught bancuh-dns to handle DoT and DoH itself. There would be fewer
components to maintain, and I could drop dnsdist, dnstap and the orchestration
between them altogether.

It didn't work out. I couldn't get the DNS library I'd built bancuh-dns on to
do it correctly. One of the problems was that replies over UDP came back from
the wrong address on servers using a floating IP, and clients threw them
away. The code is still there, marked experimental and switched off, and
production still runs dnsdist-acme in front of bancuh-dns.

Looking back, I probably jumped the gun. For now I think the two will stay
separate. We'll see.

## Looking at it properly

In September 2026, I sat down to review dnsdist-acme properly for the first
time since I'd written it. Nothing had prompted it. It had simply grown into a
project big enough that I couldn't keep all of it in my head, and I'd been
maintaining it by hand for nearly three years. I did the review with
[Claude Code](https://claude.com/claude-code), and it helped a lot.

It found more than I expected.

The version of dnsdist in the image was no longer supported, and upgrading it
turned up a trap: the new version rejected the way my code asked dnsdist to
reload its certificates. Because my code never checked whether that reload
worked, it would have kept logging "DONE" every hour while reloading nothing,
until the certificates expired weeks later and every DoT and DoH user lost
their connection at once.

That turned out to be a pattern. My code never checked whether certbot itself
succeeded, either. A failed renewal would have been treated as a success, and
the old certificate reloaded as if it were new. And the error handling had the
opposite problem: when it did notice something wrong with renewal, it shut
down the whole service, dnsdist included, so a bad hour at Let's Encrypt could
have become a restart loop on all seven servers. Each bug had been hiding the
other. In the end, certbot went away altogether, replaced by a Rust library
that fetches and renews certificates inside the program. The image shrank from
126 MB to 61 MB, and for the first time the whole certificate process has
tests, run against a test version of Let's Encrypt.

I'd also wanted to tune the rate limit, and when we measured it on the live
servers, it was dropping about 7% of all queries, around 31,000 in two hours.
DNS is bursty, and one page load can fire dozens of lookups in under a
second, far more than the limit allowed. Dropped queries make a client wait
and retry, which feels like DNS hanging. Now, instead of dropping them,
dnsdist tells the client to retry over TCP, which it does straight away. A
few other things came out too. About one in fifteen reads of the query log
had been losing entries, because a separate dnstap program wrote the queries
to a file that my code read and then emptied, in two steps, with a gap
between them. Now the Rust program reads dnsdist's query stream directly, and
both the dnstap program and the file are gone. And a key that should have
been secret had been in the public repository since the first commit. None of
it had caused an outage that I knew of. Some of it would have, sooner or
later.

By the end of that week, the image held little more than dnsdist and my own
Rust program. certbot and its Python runtime were gone, and so was the Go
dnstap tool, after the shell scripts and the Node app had already gone in
2024. It was what I'd been aiming for since that New Year: most of the work
in Rust, with dnsdist the only program I didn't write.

## Looking back

When Tomatoide asked for DoH, I didn't know how to do it. Most of what Bancuh
DNS does today started that way: someone asks, I say I don't know how yet, and
then I go and find out.

The part I'm happiest with is still the simplest one. Type a server name into
a phone's settings, and ads are blocked everywhere that phone goes. That's the
version of Bancuh DNS most people will ever see, and it's the one I'd least
want to break.

Next, and last, in the series: [eleven years of running a free DNS service](/writing/eleven-years-of-bancuh-dns/),
a look back at the whole thing.
