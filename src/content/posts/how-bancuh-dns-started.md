---
title: "Blocking ads for the whole house: how Bancuh DNS started"
description: "In 2015 I was learning web hosting and realised a DNS server could block ads for every device at home. It started on a Raspberry Pi, and eleven years later it's still running."
date: 2026-09-28
draft: true
tags: [dns, bancuh-dns, raspberry-pi, self-hosting]
---

In 2015, I kept running into the same small annoyance. I liked trying out new
Android apps, and so many of them had a banner ad glued to the bottom of the
screen. Not a big deal on its own, but it was everywhere, and it was on my
family's phones too.

I knew there was a fix. [AdAway](https://adaway.org) could block ads on
Android by filling the phone's hosts file with thousands of known ad server
names, so the phone simply couldn't find them. I liked it a lot. But it only
worked on a rooted phone, and rooting was hard, risky, and not something I was
going to do to my family's devices. Browser extensions didn't help either:
everyone at home was on their phones, not on a laptop with Chrome.

At the time, I was teaching myself web development in my spare time, which
meant learning everything around it too. I was renting a server, installing
Linux, registering a domain, and figuring out how to point that domain at my
server. I'd picked up bancuh.com, a name I liked that happened to be available.
(*Bancuh* is Malay for *to mix*, as in stirring a drink.)

Learning how domains work meant learning DNS, the system that turns a name like
`bancuh.com` into the address of a server. And somewhere in there, it clicked.
Every ad on those phones came from an ad server, and every ad server had a
name. When a phone wanted to show an ad, the first thing it did was ask a DNS
server where that name lived. **If I ran the DNS server, I could simply give
the wrong answer.**

The best part was that I wouldn't have to touch anyone's phone. At home,
everyone was on the Wi-Fi, and the Wi-Fi router told every device which DNS
server to ask. I had the router's admin password. Change one setting there, and
every phone in the house would be covered.

## A Raspberry Pi under the router

The first version ran on a Raspberry Pi 2 at home. I installed
[BIND](https://www.isc.org/bind/), the classic DNS server, and wrote a Python
script that downloaded four well-known blocklists, including the ones AdAway
used, and turned them into zone files. For ordinary names, BIND answered
normally. For ad servers, it answered with an address that led nowhere useful,
and the ad simply failed to load.

It wasn't elegant. Whenever I wanted to update the list, I'd SSH into the Pi,
copy the script over, run it to rebuild the zones, and restart BIND. But it
worked. The banner ads disappeared, on every phone in the house, and nobody
had to install anything.

My family thought it was cool. I'm not sure they ever really understood what I'd
done, but they could see the ads were gone, and that was enough.

## Then the power went out

What I hadn't thought about was what would happen when the Pi stopped working.

We had power cuts at home now and then. When the power came back, the Pi would
boot, but the DNS wouldn't always come back with it. Sometimes the SD card got
corrupted and I had to reinstall everything from scratch. A few months later, I
wrote about it on my blog:

> Sometimes, I get power outages at home, and the server would stop working.
> At reboot, it would not restore the DNS function, and we would have apparent
> network interruption because of this. Sometime the Pi SD card would break
> during power outage, and I would have to reinstall.

From everyone else's point of view, the internet was just broken. The Wi-Fi
was connected, but nothing would load. And there was exactly one person in the
house who knew why, and how to fix it:

> Point is, I am the only on[e] who knows how to fix it at my home.

I could always switch the router back to Google's DNS until I had time to
repair the Pi, and I did. But one outage was enough to hear about it for days.

So I moved the DNS off the Pi and onto two rented servers on the internet. A
power cut at home no longer mattered. The router would come back up and point
at servers that had never gone down.

It was only afterwards that I noticed what I'd done. A DNS server on the
internet doesn't just answer my house. It can answer anyone. So I started doing
it for other people too. I'd visit a friend or a relative, ask for their
router's password, change one setting, and their ads were gone as well.

## Talking to strangers

In December 2015 I started a WordPress blog on bancuh.com, "BANCUH – Tech &
Rants", signing my posts as "Barista". My first real series was "ADblock your
Wifi": four posts on why to block ads on the Wi-Fi, how to change your router,
how DNS blocking works, and one I'm still quietly proud of, on the concerns.
Because I was asking strangers to send every website they visited through my
servers, and I knew exactly how that sounded:

> I am just some random guy you found on the Internet, you have to trust me a
> little (a lot actually) to use my service.

So I wrote down what I *could* do with their lookups, what I wouldn't do, and
how they could check. I could log every site they visited. I could, in theory,
send their bank's name to the wrong place. I explained why HTTPS made that
hard, how to compare my answers with Google's, and ended with the only honest
advice I had: if you're not comfortable, don't use it.

I also made a promise that makes me smile now:

> I won't block download sites, torrents, or do any kind of censorship. For the
> moment, I am sticking to adservers only.

Bancuh DNS blocks a lot more than ads today, torrent sites included. How that
happened is a story for later in this series.

## The message on Facebook

For a while, I didn't think anyone outside my circle actually used it. At some
point, to save money, I shut the servers down. It seemed harmless: as far as I
knew, the only people using it were me and a few friends.

Then a message arrived on Facebook. It was from one of its users: the DNS
had stopped working, and they'd gone looking for the person behind it. Could I
please turn it back on?

I did. And I've kept it running ever since.

In February 2017 I put the code on GitHub, and in September 2018 the first
thank-you arrived as an issue from a stranger. Even now, I don't think Bancuh
DNS has a huge number of users, and I'm fine with that. The Facebook message
taught me something that has stuck: you don't know who depends on the thing
you built until you take it away.

## Looking back

Reading those 2015 posts again, what strikes me is how much of it was already
there. The Pi taught me that anything other people depend on can't live on an
SD card under the router. Moving to real servers taught me that once something
is on the internet, it's for everyone, whether I planned it or not. And writing
it all down, trust concerns included, is what turned a home hack into something
strangers used.

Eleven years later, the questions from that fourth post are still the ones I
think about most: why should anyone trust my server, and how do I earn it?

I pieced this history back together with
[Claude Code](https://claude.com/claude-code), from git history, old GitHub
issues, and my own blog posts rescued from the Wayback Machine. Next in the
series: how four hosts files grew into millions of entries, and why the way
BIND blocked them had to change.
