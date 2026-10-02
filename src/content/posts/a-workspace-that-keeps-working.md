---
title: "A workspace that keeps working when I close the laptop"
description: "Why I moved my personal development, and Claude Code, off my laptop and into a Coder workspace on my own server: what I tried first, what it took, and what changed once the work could carry on without me."
date: 2026-10-02T11:32:00Z
draft: false
tags: [claude-code, coder, homelab, sysbox]
---

*This is the first part of a short series on working with Claude Code from a
remote workspace. [The Android part](/writing/from-a-crash-email-to-a-real-phone/)
came out first.*

For as long as I've had side projects, they've lived on my laptop. It has
everything: the command-line tools, Docker, a VPN into my home network, and
the containers each project needs. I like to run something close to the real
setup rather than mock it out, so a lot of my work means starting a stack of
containers, and sometimes a Rust build.

That works well at a desk. It works less well anywhere else. Docker and Rust
builds go through a laptop battery quickly, so working away from home meant
carrying the laptop, starting the stack, and racing the battery. If I was
interrupted, I had three choices: close the laptop, bring the stack down, or
let it go to sleep. Any of them stopped the work. Or I went looking for a
plug.

I'd been using [Claude Code](https://claude.com/claude-code) for a while, and
it had changed how that work went. With a modern model, a lot of it can be
left to run. Most of the time I'd give it a direction, let it work, and come
back when there was something to review or decide. But it could only run as
long as my laptop was open. Every small check, every bit of debugging, meant
getting the laptop out first.

## What I didn't want

There were easier ways to move the work off the laptop, and I didn't like any
of them.

[Claude Code on the web](https://claude.ai/code) runs on someone else's
machine, which means putting my credentials there, and opening a way into my
home network so it could manage my clusters. GitHub Codespaces has the same
problem. I could have set up a development server of my own and reached it
with SSH or VS Code's remote mode, but then I'd be managing the SSH access,
the port forwarding and the tunnels myself, and opening ports I'd rather keep
closed.

What I wanted was a machine that stayed inside my network, with my tools and
credentials set up once and kept, that I could reach from anywhere without a
VPN.

## Trying Coder

[Coder](https://coder.com) does most of that. It's open source, you run it on
your own machine, and it gives you workspaces: development environments you
open in a browser, each with a terminal, a code editor and links to whatever
ports you're running.

I tried it on my laptop first. That turned out to be a good way to learn what
I'd actually need. The trial gives you a temporary public address through
Coder's own tunnel, which was too slow to be pleasant. And my workspaces
needed to run Docker themselves, which, without giving them full control of
the host, needs a runtime called [Sysbox](https://github.com/nestybox/sysbox).
Sysbox doesn't support Fedora, which my laptop runs.

So the list was short. A machine that could run Sysbox, and a proper way in
from the internet, with a domain and a certificate. In the same week, I set
it up on my home server.

## What it is

The workspace lives on a small Ubuntu virtual machine on my homelab: four
cores and 8 GB of memory. Ubuntu, because Sysbox supports it. Coder and its
database run there in Docker. Each workspace is a container, and Sysbox lets
it run its own Docker, so I can start my usual stack with Docker Compose,
just as I did on the laptop.

It's reached the same way as my websites, so I can get to it from anywhere,
without opening anything up in my home network.

Inside, it has what my laptop had: Claude Code, tmux, the same version
manager for toolchains, a web terminal, and VS Code in the browser for when
I want to look at files. Commits are signed with the workspace's own key.
And every port I start gets its own address. When I run a website on port
4321, it's at a link I can open on any device, behind the same login.

Getting that last part working was the hardest bit. Each workspace port gets a
name under a wildcard domain, which needs a wildcard certificate, and Let's
Encrypt only issues those if you can prove you own the domain through DNS.
That needed acme-dns, a small DNS server just for answering those challenges.
Who knew?

Most of the setup, I didn't do by hand. I asked Claude Code to do it, and my
part was creating the credentials, the GitHub app and the DNS records, with
it walking me through each step.

## The first evening

The first thing I did in the new workspace, on the evening of 27 September,
was ask it to clone my repositories and start simplesolat's API with Docker
Compose. Then I asked it to run a sync and push the result, and it did. Then
I asked the obvious question: "Is there a way to port-forward this api port to
my laptop?"

That question is how the wildcard addresses and the certificate got built,
that same evening. By ten o'clock it was working, and I was asking for the rework that would turn it into the
thin proxy for [the sixteen old phones](/writing/nine-countries-and-no-database/).

Somewhere in that first project, I realised I could just close the laptop and
it would keep working. Which also meant I didn't need to carry the laptop
around any more.

## Living with it

Now I reach it two ways: the browser on my laptop, and the Claude app on my
phone, through Remote Control, which shows me
the running Claude Code session and lets me answer it. If I really wanted a
proper shell away from home, an Android tablet with a keyboard would do. Most
of the time, the phone is plenty.

It changes what an alert means. My monitoring checks the Bancuh DNS servers
from my home network, and the ones in Paris kept setting it off. I didn't need
my laptop or a VPN to find out why. Claude was already inside the network, with
every tool it needed, so I just asked it to look. The servers were fine. The
path from my home connection to Paris just isn't as good, so the checks failed
now and then when nothing was wrong. It relaxed those checks, and the alerts
got quieter.

It also means work happens in parallel. I now have several Claude Code
sessions running in the workspace, each with its own job: one for my apps,
one for my homelab, one for Bancuh, one for writing this site. That wasn't
planned. It grew one session at a time. And recently, when one session had
done work that would make a good post, I asked it to message the writing
session directly, and they sorted it out between them. My part is setting the
direction.

The links to each port matter more than I expected. Before anything I build
ships, I can open it on my phone and check it. And since the workspace now has
a browser of its own, Claude Code can check it too.

## What I worry about

I think of the workspace the same way as my laptop. It has the same access,
and Claude Code already ran on the laptop the same way, so the risk is
similar. It isn't identical, though: my laptop sleeps, and this doesn't, and I
can reach it from anywhere. That's the point of it, and also the part I keep an
eye on. I'm sure I can harden it further, and I will.

The other limit is memory. 8 GB is fine for one busy workspace, which is how I
use it now. It's basically my PC at home. I'd like to try several workspaces
doing different things, and that will need more.

## What I'd like it to become

The websites for [simplesolat](https://simplesolat.com) and
[GibTalk](https://gibtalk.com) were built this way. I described what I
wanted, reviewed it in the browser, and didn't touch the code.

Anyone can ask an AI to write code now. The hard part is everything around
it. First you need somewhere to run the code, usually an editor and a setup
on your own machine. Then you need a way to try it, and then a way to put it
online. With a workspace like this, inside a network that already has a
cluster, a way in from the internet and a domain, going from an idea to
something deployed is mostly a prompt.

For now it's a proof of concept, for one person. But I think anyone, not
just people who write code, should be able to build their own web app this
way, from their phone: describe it, look at it, ask for changes, and have it
running for real. One day I'd like to give a friend a workspace of their own,
so they can build apps for themselves, without having to set any of this up.
Not yet. It's a small server.
