---
title: "One country at a time"
description: "simplesolat's first version: a widget that had to update itself, notifications that arrived twice, the simplest backend I knew, and why adding each new country cost an API change, a new sync job and an app release."
date: 2026-09-30T13:23:00Z
draft: false
tags: [simplesolat, react-native, rust, postgres]
---

*This is part two of the simplesolat story. [Part one](/writing/why-i-built-a-prayer-times-app/)
is why I built a prayer times app at all.*

When I started simplesolat in July 2025, I didn't have a backend. I didn't
think I needed one. Fareez Iqmal had already built a prayer times API, and the
first version of the app simply asked it for each zone's timetable. My part
was the app: find which zone you're in, on the phone, and show you the times.

Showing the times turned out to be the easy part.

## A widget that looks after itself

What I wanted most was a home screen widget. Not an app I had to open, but the
day's prayer times sitting on my home screen, always right. The one I had in
mind was set up once and then left alone. It should notice when I'd moved to
a different zone and switch to that zone's times. And when a prayer's time
came, it should highlight that prayer in bold, on time, without me touching
anything.

All of that has to happen in the background, while the app isn't open. On
Android, that means background tasks that wake up on a schedule, check your
location, and redraw the widget. The first widget was working within two days.
Getting it to keep itself right took much longer.

Something running in the background all day also has to be careful with the
battery, and network calls are one of the costlier things a phone does. That
was the other reason for finding your zone on the phone, on top of privacy.
Checking your location against the zone boundaries needs no network at all.
The app only goes online to fetch a timetable when it doesn't already have
one, and keeps what it fetched on the phone for next time.

## Notifications, twice

Notifications were harder still. The history of those first weeks is mostly
commits called "try fix notif".

Some of the problems were mine. When you cross from one zone into another, the
prayer times change, sometimes by several minutes. So the notifications you
already have scheduled for the old zone are wrong, and have to be cancelled
and replaced with the new zone's, in the background, before they fire. When I
got that wrong, prayers arrived twice: once for the zone I'd left, and once
for the zone I was in.

Others weren't mine. With the notifications library I started with, some arrived late, which is the one thing a prayer reminder
can't do. That turned out to be a limitation of the library. In August I
switched to another one, notifee, which could schedule them properly. It took
a while to find it, and longer to get it right, but it worked.

Then simplesolat went quiet for a couple of months. It didn't stop, though. I
used it every day, and every day was a test.

## The simplest backend I knew

In November, I came back to the part I'd been borrowing. Fareez's API had
done the job, but it was someone else's. If it changed, or shut down, my app
would break, and so would the widget on everyone's phone. I'd learned that
lesson once already with [GibTalk's pictures](/writing/where-the-pictures-come-from/),
and I didn't want to learn it again.

So I built the simplest backend I knew. An API in Rust. A Postgres database
with two tables, one for zones and one for prayer times. And a sync job that
fetched the official timetables from JAKIM, Malaysia's Department of Islamic
Development, and saved them into the database, so the API could answer from
its own copy. It's the most common shape a backend takes, and it took
about a week.

The same weekend, the app got its name. Until then it had been called
*monoso*, short for monospaced solat times. From the first week, every number
in it was set in a monospaced font, the kind you see in a terminal or a code
editor, where every character takes the same width. I liked how that looked
for a column of times, and I wanted the rest to match. Many prayer apps are
beautifully decorated, with geometric patterns and calligraphy. I wanted
something plainer: black and white, very little on the screen, just the times.
It looked more like the tools I use every day, and that suited me.

The name changed, but the look stayed. It became **simplesolat**, got an icon,
the JetBrains Mono font and a dark mode, and on 16 November 2025, after
Google's review, it went up on the Play Store.

## Getting ready for Ramadan

In February 2026, Ramadan was a few days away, and I knew what I'd want from
the app during a month of fasting. The first thing was *imsak*, the time a
little before dawn when you stop eating before the fast begins. It went into the app, the notifications and a new widget
that shows it alongside the other times. I also tried a larger widget, but I
never got the design right, and it didn't ship. Then came a way to swipe
between today's and tomorrow's times, so you can check tomorrow's imsak the
night before.
And a Qibla compass, pointing towards Mecca, with a hint when the phone's
compass needs calibrating.

Most of it was for me. But I'd guessed other people fasting would want the
same things at the same time of year.

## One country at a time

In March, I started thinking beyond Malaysia. The obvious next step was the
places a Malaysian might travel to: Singapore, Indonesia and Brunei. Each had
a good official source of prayer times that I could fetch.

Working with [Claude Code](https://claude.com/claude-code), I added all three
in two days. Singapore came from MUIS through Singapore's open data portal.
Indonesia came from EQuran.id, with 517 zones. Brunei's came from its Ministry of Religious Affairs, which keeps a prayer
times list on its website, with small official adjustments for each district:
one minute later in Tutong, three in Belait.

And each one cost the same three things.

The API needed a new sync job for that country's source, which ran on a
schedule and could fail at any time, live, with nobody watching. If it did,
that country's times would quietly stop updating in the database.

The database needed the new zones and every day's times for all of them.

And the app needed a new release, because the list of zones, and the boundaries
used to find which one you're in, were built into the app itself. Three
countries meant three releases in two days: 1.0.8, 1.0.9 and 1.0.10. Anyone who
didn't update wouldn't get the new countries at all.

It worked. But it was clear that this wouldn't scale. Every new country would
mean another scheduled job that could break, more rows in a database, and
another release that people had to install. The backend I'd built because it
was simple was making every change expensive.

## Looking back

The simplest design I knew wasn't the simplest design for this problem. An API with a database is the right shape when the data changes all the time
and people ask for it in lots of different ways. Prayer times aren't like
that. Most countries publish a whole year's timetable in advance, and once
it's out, it rarely changes. Bosnia's repeats every year, apart from daylight
saving.

A couple of weeks later, the fourth country, Sri Lanka, came as a set of
static files instead, and that changed how I thought about the whole thing.
That's the next post.
