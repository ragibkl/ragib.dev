---
title: "A passing comment, and my first Rust project"
description: "How a colleague's offhand remark got me learning Rust, and how rewriting Bancuh DNS's blocklist compiler let every server build its own list at startup."
date: 2026-09-28T18:00:00Z
draft: false
tags: [rust, dns, bancuh-dns]
---

*This is part three of the Bancuh DNS story. [Part two](/writing/the-user-who-wouldnt-let-me-turn-it-off/)
is about the users who shaped it between 2017 and 2020.*

Some of the biggest turns in my career started with a colleague saying
something in passing.

At my first software job, a colleague talked about Python. I didn't know much
about it, so I started learning it on my own time. Before long I was writing
Python every day, and it was what got me my second job. Years later, at another
job, a colleague mentioned a language called Rust, and called it a cool new
language. I decided to try it out. In 2019 I worked through some
[Advent of Code](https://adventofcode.com) puzzles in Rust, but puzzles only
take you so far. I needed something real to build.

## A list that kept growing

By then, I had just the thing. Bancuh DNS's blocklist started out in 2015 as
four hosts files and around 50,000 domains, stitched together by a small Python
script. Every time a user asked me to block something new, the list grew. By
2019 it pulled from several sources, and it would keep growing: about 35
sources by 2021, and more than 70 today.

The Python script did its job in the simplest possible way. It went through the
list of URLs one at a time: download a source, parse it, move on to the next.
With four sources that was fine. With dozens, most of the time was spent
waiting on the network, one download after another.

The speed mattered because of *where* the compile ran. The list was compiled
ahead of time, when I built the Docker image, and then baked into the image.
Every change to the list meant building a new image and redeploying it to
every server. What I really wanted was for each server to compile its own
list when it started up. Change the list once, and every server would pick it
up. For that, the compile had to be fast, and the Python version wasn't.

## Rewriting it in Rust

So in February 2020, the blocklist compiler became my first real Rust project.

The part I cared about most turned out to be the part Rust made easy. Instead
of fetching sources one at a time, the new compiler started a task for every
source at once and waited for them all to finish. Downloads that used to queue
up behind each other now happened side by side, and the total time came down
to roughly the slowest single download.

Getting there was hard. By then I'd written Python and Django, React Native,
and a bit of Ruby on Rails, and picking up a new language had never been much
of a struggle. Rust really took the cake. It was, by some distance, the hardest
language I had tried to learn.

By April 2020 the Rust version had replaced the Python one entirely. I moved
the old script into [its own repository](https://github.com/ragibkl/adblock-compiler-python),
in case anyone still wanted it, and deleted it from the project.

## Compiling at startup

The rewrite didn't get me to my goal straight away. At first, the Rust
compiler still ran when the image was built, just faster. The next steps came
in 2021:

- In March, I put the compiler itself inside the DNS server's image.
- In June, I moved the blocklist configuration into the GitHub repository, so
  that a server could fetch it from there when it started.
- A few days later, I added a self-updating version. On startup, a server
  fetched the latest configuration, compiled its own list, and started serving
  with it.

That was what I'd wanted all along. To block a new domain, I changed a file
on GitHub, and every server picked it up on its next update. No new image, and
no redeploying the list by hand.

It also meant a lot more work was now happening on the DNS servers themselves,
on small, cheap machines, while they were also answering queries. The list
kept growing into the millions, and the next few years were mostly about
dealing with what that did to memory and uptime.

## Looking back

I don't think I'd have learned Rust without that comment. And puzzles alone
wouldn't have made it stick. What did was having a real, slow program that
annoyed me, and a colleague who had given me an idea for fixing it.

Rust went on to become the language I use for most of what I build, including,
later, the DNS server itself. But it started with a list of URLs, fetched one at
a time, and a colleague who thought a new language was cool.

Next in the series: [what happened](/writing/what-self-updating-servers-broke/)
when small, cheap servers started compiling millions of domains while also
answering everyone's DNS queries.
