---
title: "Giving the workspace a browser"
description: "Adding a real browser to my Coder workspace so Claude Code could check the websites it builds: what it caught, where it still needs me, and the memory problem that took the whole machine down."
date: 2026-10-02T23:36:00Z
draft: false
tags: [claude-code, coder, browser, testing]
---

*This is part three of a short series on working with Claude Code from a
remote workspace. [Part one](/writing/a-workspace-that-keeps-working/) is why
the work moved off my laptop.*

On my laptop, I'd sometimes let Claude Code use my browser. Some things it can
fetch with a plain request, but some sites only make sense in a real browser.

The best example was shopping for a server. I was looking for a used tower
workstation to be my next homelab machine, at a local computer shop, NTS
Computers, and there were far too many options to compare by hand. So I let
Claude Code look through the relevant sections in my browser and pull out the
models that fit. Once it had worked out how the site loaded its listings, it
stopped clicking and wrote a small Python script to fetch them directly. It
also tried the shop's system builder, to see whether they could build what I
wanted, and looked on Amazon for server memory to go with it. Because it did
both, it already knew which machine the memory was for, and could find the
right kind. That's one less place for me to make a mistake. I went off and did
something else, and came back to a shortlist.

That's the pattern I like: use the browser to understand a site, then use
something simpler once you can. I still prefer command-line tools and APIs
when they exist.

## Why the workspace needed one

When I moved my work into a [Coder workspace](/writing/a-workspace-that-keeps-working/),
the browser didn't come with it. On the laptop I used VS Code with the Claude
Code extension, one window per project. In the workspace, Claude Code runs in
tmux, in my home directory, so every session survives and comes back after a
restart. VS Code is still there in the browser for looking at files, but an
extension in it only lives as long as the browser tab does. The trade-off is
that the sessions persist, but nothing there could see a web page.

And I was building a lot of web pages. The sites for simplesolat and GibTalk,
this site, and the link previews for all of them. Claude Code could build them,
run them and fetch them, but not look at them. Every visual check came back to
me.

So on 1 October, I gave the workspace a browser of its own: Chromium, in a
container, running all the time. Claude Code drives it. I can watch it through
a link in Coder, and take over when I need to.

I gave it its own identity, too. It isn't signed in to my main Google account.
I log it in only to what a task needs, and anything that needs my real
accounts stays with the Claude Code on my laptop: Search Console, the Play
Console, LinkedIn.

## Buying sambal

The first real test wasn't a website of mine. I wanted to know whether an agent
could handle buying something, so another Claude Code session tried to order
Sambal Nyet Berapi, by Khairulaming, on Shopee. If you're Malaysian, you'll
know it: about as Malaysian a thing to buy online as there is.

It got a long way, but not on its own. Shopee protects itself against bots, so
I had to step in to log in and to solve the CAPTCHA. At checkout, the bank asked
for 3-D Secure approval. Claude Code stopped and told me, I approved it on my
phone, and the payment went through. It's a pre-order, and it's popular, so
I'm still waiting for it to arrive.

So shopping on a big, well-defended site still needs a person at a few points.
That's probably as it should be. But the same browser is good at the work I
actually wanted it for.

## Checking its own work

Until then, when Claude Code checked a page, it fetched the HTML and read it,
or rendered an image and looked at that. Useful, but not the same as seeing the
page. A real browser gives it what a real phone gave it for
[my apps](/writing/from-a-crash-email-to-a-real-phone/): the actual result,
which it can look at: Claude can read a screenshot much as it reads text. So on 2 October, I asked
it to try. I wanted to know how much more confident its checks could be with
better tools.

It opened [gibtalk.com](https://gibtalk.com) and
[simplesolat.com](https://simplesolat.com) at a phone's size, took
screenshots, and ran Lighthouse, which scored both 100 for accessibility, best
practices and SEO. Then it used them. On gibtalk.com, it searched the symbols
for "eat" and got a hundred pictures back. On simplesolat.com, it picked
Malaysia, then Gombak, and read back JAKIM's prayer times for the day.

It also found something I hadn't. When it tried simplesolat.com's **Use my
location** button, the page sat on "Finding your location…" forever, because
the browser was waiting on a permission prompt that the automation couldn't
answer. While it waited, the zone list stayed disabled, until the page was
reloaded. That's partly a limit of driving a browser this way. But it's also a
question worth asking about a real visitor who ignores the prompt.

Then I asked it to check this site. It took screenshots of the home page on a
desktop, a post with screenshots on a phone, the projects page in dark mode,
and a post with code in it. Then it went through every page in the sitemap, 21
of them, at a phone's width, looking for anything that scrolled sideways and any
image that didn't load. There weren't any. The one thing it noticed was a code
block whose comments run off the edge on a phone. You can scroll it, so it isn't
broken, but it's easy to miss.

That's what I wanted: for it to look at what it built before I do, and fix it
without waiting for me.

It also works before anything ships. The browser runs in its own container, so
to see a site running in the workspace, it has to use the workspace's address
on the container network rather than `localhost`. It took one failed page load
to learn that. After that, it could check a draft of a post before it went out.

## The day it took the machine down

The first browser tool I used was Chrome DevTools' MCP server, which gives
Claude Code tools for driving the browser. Every Claude Code session starts its
own copy, and each copy keeps track of every tab in the browser, not just its
own. I had several sessions running. One copy grew to 1.7 GB.

The workspace runs on a machine with 8 GB of memory, and on 2 October it ran
out, twice. The first I knew of it, Coder froze. The latency in its top bar
climbed to 25 seconds, the browser stopped responding, and the Claude app on my
phone showed the sessions as offline. The machine's processor was at 3.7 of its
4 cores, probably the kernel trying hard to free memory. Both times, it ended
with the kernel killing Chromium to recover.

There were two fixes. The first was a different tool. Another session found
[agent-browser](https://github.com/vercel-labs/agent-browser), a small
command-line tool written in Rust, which used 11 MB when idle and about 110 MB
after loading 18 heavy pages. Every session now uses it, each with its own
named session and its own tab, so they don't fight over the same page.

The second was to stop one workspace from taking down everything else. The
machine had no swap, and the workspace had no memory limit, so a spike inside
it starved Coder itself. Now there's 4 GB of swap as a safety net, and the
workspace is capped at 6 GB, so the next spike is stopped inside the workspace
while Coder keeps running.

## Where it's useful, and where it isn't

A browser in the workspace is good for what it was meant for: checking web
work, finding layout problems, and exploring a site to understand how it works.
It's less good at anything with a login, a CAPTCHA or a payment, where it needs
me, and it's slower than a person, because it sees the page through snapshots
and screenshots.

For the server shopping, I think I'll try it again from the workspace, now that
the memory problem is solved. I'll give it the direction, and come back to a
shortlist.
