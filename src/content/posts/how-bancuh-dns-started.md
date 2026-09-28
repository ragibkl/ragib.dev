---
title: "Blocking ads for the whole house: how Bancuh DNS started"
description: "In 2015 I was learning web hosting and realised a DNS server could block ads for every device at home. It started on a Raspberry Pi, and eleven years later it's still running."
date: 2026-09-28
draft: true
tags: [dns, bancuh-dns, raspberry-pi, self-hosting]
---

This is the first post in a series about [Bancuh DNS](https://bancuh.com), a
free public DNS service that blocks ads. It has been running for about eleven
years, and most of what I learned along the way lives in commit messages, old
GitHub issues and a blog that no longer exists. I dug through all of that with
[Claude Code](https://claude.com/claude-code) to piece the history back
together, including my own blog posts from 2015 recovered from the Wayback
Machine. This series is me writing it down properly.

## 2015: learning how the web works

In 2015 I was teaching myself web development in my free time, and that
meant learning everything around it too: renting a server, installing Linux,
registering a domain, and pointing it at a web server. I registered
bancuh.com, simply because I liked the name and it was available. (*Bancuh* is
Malay for *to mix*, as in stirring a drink.) By the end of the year it also
hosted a WordPress blog, "BANCUH – Tech & Rants", where I signed my posts as
"Barista".

Learning how domains work meant learning DNS: the system that turns a name like
`bancuh.com` into an IP address. Somewhere in there it clicked. **If you
control the DNS server, you control the answers.** Ads come from ad servers,
ad servers have names, and a DNS server could simply refuse to give the right
answer for those names.

## The problem I wanted to solve

Ads were everywhere, and blocking them was a per-device chore. Here's how I
put it at the time, in the first post of a series I called "ADblock your
Wifi":

> Adblock extension for Chrome / Firefox work well, but are limited to
> PCs/Laptops only.

Browser extensions only covered one browser. On Android there was
[AdAway](https://adaway.org), which blocks ads by filling the phone's hosts file
with thousands of known ad server names, but it needed a rooted phone. iPhones
couldn't do it at all. And every family member's device had to be set up
separately.

But every device at home used the same Wi-Fi router, and the router told every
device which DNS server to use. Change that one setting, and every phone,
laptop and tablet in the house would be covered.

`[Your take: what did your family think? Were the ads on someone else's device the trigger?]`

## Version one: a Raspberry Pi and some zone files

The first version ran on a **Raspberry Pi 2** at home. It was
[BIND](https://www.isc.org/bind/), the classic DNS server, with a Python script
that downloaded four well-known blocklists, including the ones AdAway used
(`adaway.org`, Peter Lowe's list, MVPS and hpHosts), and turned them into zone
files. For ordinary names, BIND answered normally. For ad servers, it
answered with the wrong address on purpose. In the version I later made
public, that was the DNS server's own address, where a small web server
replied to every request with a 404 page. Either way, the ad simply failed to
load.

It worked. Ads disappeared from every device in the house.

`[Your take: anything you remember about building it? What was hard?]`

## Then the power went out

The flaw wasn't in the DNS. It was in where the DNS lived. In early 2016 I
wrote:

> Sometimes, I get power outages at home, and the server would stop working.
> At reboot, it would not restore the DNS function, and we would have apparent
> network interruption because of this. Sometime the Pi SD card would break
> during power outage, and I would have to reinstall.

And the part that really mattered:

> Point is, I am the only on[e] who knows how to fix it at my home.

When the Pi went down, the whole house lost the internet. As far as anyone
else could tell, the Wi-Fi was broken, and I was the only person who could fix
it. So I moved the DNS servers off the Pi and onto two rented servers
(VPSes). A power cut at home no longer mattered: the router came back up and
pointed at servers that had never gone down.

That had a side effect I hadn't planned: servers on the internet can answer
anyone. I started visiting friends and relatives, changing one setting on their
routers, and their ads were gone too.

## Offering it to strangers

In December 2015 and January 2016 I wrote the four-part "ADblock your Wifi"
series: why DNS blocking, how to change your router, how it works, and
finally the concerns. That last part has aged well, because I was already
wrestling with the question I still think about today: **why should anyone
trust a stranger's DNS server?**

> I am just some random guy you found on the Internet, you have to trust me a
> little (a lot actually) to use my service.

I covered privacy (a DNS server *could* log everything you visit), phishing (a
DNS server *could* send your bank's name to the wrong place, though HTTPS makes
that hard), and what happens if the server itself gets compromised. My answer
was mostly honesty: here's what I could do, here's what I won't do, here's how
to check, and if you're not comfortable, don't use it.

I also made a promise that makes me smile now:

> I won't block download sites, torrents, or do any kind of censorship. For the
> moment, I am sticking to adservers only.

Today, Bancuh DNS blocks gambling, torrent sites, VPNs and a lot more. How that
happened, and why, is a story for a later post in this series.

## What happened next

In February 2017 I put the code on GitHub as
[adblock-dns-server](https://github.com/ragibkl/adblock-dns-server). In
September 2018, the first thank-you arrived as a GitHub issue from someone I'd
never met. That's when I realised it wasn't just for my friends any more.

`[Your take: the time you shut the servers down and someone tracked you down on Facebook to ask you to turn them back on. When was it, and what did they say?]`

## What I took away

- **Infrastructure your family depends on shouldn't live on an SD card.** A
  Raspberry Pi is a great way to learn, and a poor way to run the house's
  internet. The moment other people depend on something, "it works on my
  machine" stops being enough.
- **Moving it somewhere more reliable changed who it was for.** I moved to
  rented servers for reliability, not to run a public service. But once it was
  on the internet, sharing it cost nothing.
- **Writing it down is what made it real.** Publishing that blog series, trust
  concerns and all, is what turned a home hack into something strangers used.
  Which is part of why I'm writing again now.

Next in the series: how the list grew from four hosts files into millions of
entries, and why the way BIND blocked them had to change.
