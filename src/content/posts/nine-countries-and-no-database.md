---
title: "Nine countries and no database"
description: "How simplesolat's prayer times became static files on a CDN: why official timetables matter, designing data for apps nobody updates, adding countries on a hunch, and the sixteen users who kept my API alive."
date: 2026-09-30T15:19:00Z
draft: false
tags: [simplesolat, static-data, netlify, claude-code]
---

*This is part three, and the last part, of the simplesolat story.
[Part two](/writing/one-country-at-a-time/) ended with three new countries,
three new sync jobs and three app releases in two days.*

Before I could decide how to store prayer times for more countries, I had to
be clear about which prayer times people actually want. That turned out to be
less obvious than it sounds.

## What people expect from a prayer app

There are two ways to get prayer times. You can calculate them: the times
follow the sun, and there are well-known formulas, each with slightly
different angles for dawn and nightfall. Or you can use an official timetable,
published by a country's religious authority, zone by zone and day by day.

The two don't always agree. JAKIM's times for a Malaysian zone can differ from
a standard calculation by a few minutes, because of adjustments made for each
zone. And the Malaysians I know expect JAKIM's times, by hook or by crook. The
apps that serve them well tend to be JAKIM-only. The global apps tend to
calculate everything, and they draw a lot of frustration from users whose
phone disagrees with their mosque.

People here also don't think in coordinates. They think in zones, or in their
*qariah*, the community of their local mosque. That's why I'd adopted Fareez's
approach of matching your location against the real zone boundaries.

When a friend tested the app, we noticed it put him in a different zone from
the prayer app he usually used. That app picked the zone whose centre was
closest to him, and mine used the boundaries. We tried to work out which one
was right, and I asked which times his mosque displayed. He didn't know, and
we never quite got to the bottom of it. But it made the point for me: what
matters is the zone you're actually in, and the times your mosque will call
the azan at.

So the rule became: if a country's religious authority publishes official
times, use them. I guessed Muslims elsewhere would expect the same as
Malaysians do. And if you travel somewhere that doesn't have them, you'd most
likely accept the most common calculation method for that part of the world.

In late March, I added that fallback to the app. Outside the countries with
official data, it now works out the times on the phone, using a method chosen
by country: Umm al-Qura for Saudi Arabia, Turkey's own method, the Muslim
World League where there's nothing more specific. It's a good-enough default,
so the app works anywhere, even where there's no official method at all.

## Sri Lanka, and the files

The fourth country came from Reddit. On r/SriLankanMuslim, someone had
written about the prayer apps they used. They often stayed in places with no
mosque nearby, so they depended on an app, and the times were always off by a
few minutes for Sri Lanka. They were thinking of building a Sri Lanka app of
their own.

It was the same problem Malaysians have with global apps, so I replied. I asked
whether the few minutes came from apps calculating times instead of using
published ones, and whether any Islamic authority in Sri Lanka published
official times. If so, I'd be glad to add them to simplesolat.

There is one: the All Ceylon Jamiyyathul Ulama, or ACJU. They publish their
timetable as PDFs, one per district per month, for the whole year. There's no
API to call. There's nothing to sync. In early April, Sri Lanka's 13 districts
went into the app, and I went back to the thread to say it was live, and to
ask whether the times matched their local mosques.

So Sri Lanka went in as static data. The first files came from
[prayer-time-lk](https://github.com/thani-sh/prayer-time-lk), an open dataset
someone had already extracted from ACJU's PDFs, which I checked against the
PDFs themselves. Soon after, I was extracting them myself. It was the one
country my API and its sync jobs couldn't fetch from anywhere, so the API had
to carry the files itself. And that made me look at the other four countries
differently.

The sync jobs had been giving me trouble. Now and then one would fail, quietly:
a source rate-limited me, changed its format, or was just flaky that day. To
debug the gaps, I'd started pulling the data down on my laptop and compiling
it into clean static files, just to see what was going on. At some point I
realised that if I was already producing clean files on my laptop, I didn't
need the backend at all. The app didn't need a live API. It needed reliable
data. A timetable is published in advance, and once it's out, it rarely
changes. What if the files were the whole backend?

Over the first two days of April, working with
[Claude Code](https://claude.com/claude-code), I built
[simplesolat-data](https://github.com/ragibkl/simplesolat-data). It's a plain
repository of files: one small JSON file per zone per month, a list of zones
for each country, and the boundaries used to find which zone you're in. A
script for each source fetches its timetable. Where a source has an API, a
scheduled job fetches the next month's times and commits them. Where it's a
PDF, I run the script by hand once a year. Every change goes through a
validation script that checks each day's times are in order, each month has
the right number of days, and no two countries use the same zone code.

The difference from the database was bigger than I expected.

When data is a file, you can fix it by editing the file. On 3 April, JAKIM's
data for one zone in Sabah said imsak was at 15:20, in the middle of the
afternoon. I corrected it by hand and noted it to report. Sri Lanka's 2026
PDFs included a 29 February, in a year that doesn't have one, so it went.

And every file has a history. For any day in any zone, git can tell you where
the number came from, when it arrived, and whether anyone has touched it since.

## Designing for apps nobody updates

The app changed too. Version 1.1.0 stopped asking my API for anything, and
fetched the files straight from a CDN.

The hardest part of that wasn't the prayer times. It was everything around
them. Zone boundaries are big files, and I wanted phones to download them as
rarely as possible. But I also needed to be able to fix them later. And I
couldn't rely on anyone updating the app, because most people rarely do.

So the app starts from one small file, `countries.yaml`, which it fetches
again about once a month. For each country, it lists where to find the zone
boundaries and the mapping from boundaries to zones. Those big files have the
date they were made in their name, and the app keeps them forever. When I need
to change one, I publish it under a new date and update the list. Phones pick
up the new name within a month and download the new file once. Nobody has to
install anything.

The app also stopped carrying the boundaries itself. It now downloads only the
country you're in.

None of this would work if the server had to know where you are. It doesn't.
Your phone works out your country and your zone, and then asks for one small
file by name. That's also what made a CDN enough. I tried GitHub Pages first,
but it was slow for these files, so on the same day I moved them to Netlify.

## Nine countries, on a hunch

Once adding a country meant writing a fetch script rather than changing an API,
a database and the app, I wanted to add as many official sources as I could.

Singapore, Indonesia and Brunei had come first because of how many Muslims
live there, and how often Malaysians travel between them. For the rest, I had
no idea if anyone would use them. But adding one cost about one Claude Code
session. The benefit wasn't guaranteed, but it might be a nice surprise for
someone.

Turkey came the next day, with 867 districts from Diyanet, and the UAE with 60
areas. Bosnia followed in June, and Albania in July.

That made nine countries with official times, and a calculated fallback for
everywhere else. The feature people mention most is the widget. Commute from Johor Bahru
to Singapore, and it switches from JAKIM's times to MUIS's without you opening
the app. Land in Istanbul, and it's showing Diyanet's.

## Being found

Until March, simplesolat grew slowly. It was on about 60 phones by the start
of Ramadan.

Then, on 16 March, near the end of Ramadan, I contacted Pendakwah Teknologi,
a Malaysian page that shares technology news with around 140,000 followers on
Facebook.

They shared it on their Facebook page the next day. Their post described it as
fast, simple and free, with no ads and no plans to ever charge, using official
data only. It ended with a line I didn't expect. In English, it reads roughly:
"May the reward keep flowing, as people use your app to make their prayers
easier." It's the idea of *sadaqah jariyah*, a charity whose reward continues
for as long as people benefit from it, and it's exactly what I'd hoped
simplesolat could be.

Within a day, the number of phones with simplesolat went from about a hundred
to over 350.

Brunei had the same kind of moment. It had been supported for three weeks, on
four phones. On 5 April I posted about it on
[r/nasikatok](https://www.reddit.com/r/nasikatok/), Brunei's subreddit, named
after the country's favourite rice dish, explaining that the widget
switches to KHEU's times on its own when you cross into Limbang or fly to
Kuala Lumpur. Two days later, it was on 33 phones in Brunei.

By mid-April, simplesolat was on about 540 phones. Today it's on about 600,
nine in ten of them in Malaysia. That's not many, but none of them came from
an ad.

## The sixteen

Moving to static files didn't quite get rid of the backend, though. Phones on
version 1.0.x still asked my API for their times. So the API stayed,
now syncing from the data repository instead of the original sources, with its
Postgres database and its scheduled jobs.

In September I went to take the whole thing down, assuming everyone had
updated by then. They hadn't. On 26 September, the Play Console showed sixteen
phones still on a 1.0 version, spread across eight different builds. Three
were still on the very first one, from November.

I couldn't make them update, and I didn't want their widgets to go blank. So I
compromised. The API became a thin proxy: when an old app asks for a zone's
times, it fetches the same static files from the CDN, keeps a copy for a
while, and answers in the old format. The database went. The scheduled jobs
went, which I was glad about, because I'd never watched them closely. It uses
less memory, and there's far less that can go wrong.

It's still a backend, strictly speaking. But it has no data of its own
any more, and one day, when those sixteen phones finally update, it can go
too.

## Looking back

Adding a country used to be a code problem. Now it's a data problem, and data
problems are much easier to live with.

The simplest design turned out not to be the one I knew best, an API with a
database, but the one that matched the data: a timetable published once, a
phone that knows where it is, and a file for every zone and month. The work
moved from keeping a server running to checking that the numbers are right,
and that's where I'd rather spend it.

simplesolat is free, with no ads, on
[Google Play](https://play.google.com/store/apps/details?id=com.simplesolat.app),
and the code and the data are [on GitHub](https://github.com/ragibkl/simplesolat).
