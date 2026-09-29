---
title: "Why I built a prayer times app"
description: "The prayer times app I relied on stopped working on New Year's Day 2024, and I found out its developer had passed away months earlier. simplesolat started as my attempt to follow in their steps."
date: 2026-09-29T21:00:00Z
draft: true
tags: [simplesolat, react-native, android]
---

I'm a Muslim, and I try to pray the five daily prayers on time. I don't always
manage it. Some days I miss one, and I do my best. Each prayer has a window,
and the times shift a little every day and from place to place. So, like most
Muslims with a phone, I rely on a prayer times app.

What I need from one is simple. It should show today's times for exactly where
I am, with the current prayer highlighted so I can see it at a glance. It
should remind me when each prayer starts, so I don't miss one. And it needs a
widget on my home screen, because the whole point is not having to open an
app to check.

It should also show *Syuruk*, sunrise, which is when the time for the dawn
prayer, *Subuh*, runs out. Some mornings I pray Subuh late, and the first thing
I need to know is whether I've still got time or already missed it. Surprisingly
few apps show it.

That turns out to be surprisingly hard to find.

## A lot of apps, and very few good ones

I've always used Android, and there's no shortage of prayer times apps for it.
But most of them have ads, a premium subscription, or a paywall for the
features that matter. The free, ad-free ones often don't work very well.

The most common problem is how they fetch the times. Many download a month's
timetable for one location, and then stop. If you travel, or the month rolls
over, the times go stale until you remember to open the app and make it
update, which rather defeats the point of a widget. And most apps only know
about Malaysia, using the official timetable from JAKIM, Malaysia's Islamic
development department. Cross the border and you're on your own.

In all my years of looking, I found two apps that I thought were genuinely
good. The one I settled on was [iSolat](http://ppkt.eng.usm.my/iSolat/),
published under the name MKMN, with its support pages hosted at Universiti Sains
Malaysia. It was free, it had no ads, and it did nearly everything well enough.
It had been downloaded around 380,000 times.

## New Year's Day

When 2024 arrived, iSolat stopped working. The new year's prayer times simply
weren't there, and it wouldn't download them.

I emailed the address in the app to report it. The reply came almost
immediately:

> Assalamualaikum, Developer asal app ini telah meninggal dunia pada 26.9.2023
> lepas...

*The original developer of this app passed away on 26 September 2023.* The
reply went on to say that USM had taken the app over, and would update it
soon.

I was devastated. For more than three months after their death, their app had
carried on quietly reminding its users when to pray, right up until the day
the data ran out.

I wrote back to send my condolences to the developer's family, and to thank USM
for keeping the app going. I'm a backend developer, so I offered to help if
they needed it. A little later, the maintenance was done and the prayer times
were back. iSolat lives on, looked after by USM.

Al-Fatihah.

## Following in their steps

That email stayed with me. I found myself wanting to do what they had done: to
build something useful, give it away, and keep it going.

I had my own list of what it should be:

- **Simple.** Today's times, all seven of them including Syuruk, the current
  one in bold, and nothing else in the way.
- **No ads, and free.**
- **Private.** Some prayer apps send your GPS location to a server to work out
  which timetable you need. I didn't want mine to send anyone's location
  anywhere.
- **Not just Malaysia.** It should keep working when you travel.

I was also curious whether modern React Native, the same framework I'd used to
build [an app for my kids](/writing/building-an-aac-app-for-my-kids/), could
handle the things a prayer app has to get right in the background: widgets that
update on their own, and notifications that fire on time.

I started simplesolat in July 2025. The home screen widget went in within the
first couple of days, and prayer notifications a few days after that.

## Standing on others' work

I didn't start from nothing. A developer named Fareez Iqmal had built a
similar app, and I first tried using the prayer times API he'd made. His
approach to zones inspired mine, too. Each country's official timetable is
published per *zone*, a group of districts that share the same times. His
backend used GeoJSON, a standard format for shapes on a map, to describe where
each zone's boundaries lie, and to find which zone a location falls in.

I thought about a simpler approach first: pick whichever zone's centre is
closest to you. But zones aren't circles, and near a border, the closest centre
can easily be the wrong zone. Real boundaries were better.

The difference in simplesolat is *where* that happens. Instead of sending your
location to a server to look up, the app does it **on your phone**. It
downloads the GeoJSON boundaries once, keeps them, and checks your location
against them locally. Your location never
leaves the device. All it ever asks a server for is the timetable for a
zone.

The first version got its timetables from an API I wrote myself, in Rust. Later
I realised I didn't need an API at all, only static files that anyone could
download. That turned out to be simpler, cheaper, and even more private. It's
also how simplesolat came to support official timetables for nine countries.
That's the next post in this series.

## Looking back

I still think about that reply. Someone built a small, free, useful
thing, and it went on helping people after they were gone. I don't know if
simplesolat will ever reach as many people as their app did. But if it helps
someone not miss a prayer, on a trip, or on the first day of a new month, then
I'm following in their steps the best way I know how.

simplesolat is free, with no ads, on
[Google Play](https://play.google.com/store/apps/details?id=com.simplesolat.app),
and the code is [on GitHub](https://github.com/ragibkl/simplesolat).
