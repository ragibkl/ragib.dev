---
title: "A website for a prayer times app"
description: "Building simplesolat.com in a day: live prayer times that find your zone in the browser without sending your location anywhere, a calculated fallback for the rest of the world, and the country code that would have given France the wrong times in the app."
date: 2026-10-10T13:23:00Z
draft: false
tags: [simplesolat, astro, geojson, claude-code]
---

*A follow-up to [the simplesolat series](/writing/why-i-built-a-prayer-times-app/),
which ends with [nine countries and no database](/writing/nine-countries-and-no-database/).*

For a long time, [simplesolat](https://play.google.com/store/apps/details?id=com.simplesolat.app)
had no website. There was a Play Store listing, a GitHub repository, and a
privacy policy in that repository that still said Malaysia only, and still had
`[Your email address]` where my email address should have been. I owned
simplesolat.com, but it pointed at a server with nothing behind it. Anyone
who typed it in got an error.

On 29 September, I decided that wasn't good enough.

## Why a website at all

A store listing tells you what an app is in a few lines. I wanted somewhere
people could learn what it actually does, feature by feature. And somewhere
to get help. The app had had crashes I couldn't explain, and when one hit,
users had nowhere to go: no troubleshooting steps, no way to contact me except
a review. When one user's app [kept crashing](/writing/from-a-crash-email-to-a-real-phone/),
they emailed me.

I also think a real website helps people decide whether to trust an app. A
prayer times app asks for your location and sends you notifications five times
a day. If it has a proper page, with a privacy policy that matches what it
does and a way to reach the person who made it, it looks like someone stands
behind it.

## Prayer times at the top

I asked Claude Code for one more thing: a small widget at the top of the page,
showing today's prayer times, for your country and zone or for your location.

That was for two kinds of people. Someone on a laptop who wants to try the
service before installing anything. And someone who already has a prayer app
they trust. In Malaysia, people expect JAKIM's times; in Singapore, MUIS's.
With the widget, they can check mine against theirs, see that they match, and
stop worrying.

The widget had to work the same private way as the app. When you tap **Use my
location**, the browser checks which of the nine countries you might be in,
downloads that country's zone boundaries, works out your zone itself, and only
then fetches that zone's timetable. Your location never leaves the browser.

That needed one change on the data side. The timetables are served from a CDN,
and browsers won't let a page on one site read files from another unless that
site allows it. One small rule in the data repository fixed that, and as a
side effect, any other developer can now use the data from their own pages too.

## Nine countries, one broken

Before calling it done, Claude Code tested **Use my location** with a real
place in every one of the nine countries, plus a few awkward ones near borders.
Johor Bahru, for example, is a few minutes from Singapore, and has to land in
Malaysia.

Jakarta failed, and not with the polite "no official timetable here" message.
Something was throwing. Indonesia's boundary file turned out to contain one
region with no shape at all, and the code that checks whether a point is inside
a shape fell over on it. That one empty region broke every lookup in Indonesia.
The fix was to treat a missing shape as "not here".

There was also a strange rendering bug: the space before some links was
disappearing, so words ran into each other. It came from the way Astro
compressed the HTML, and it turned out this site had it too. The About page on
ragib.dev said I'd built "anapp" for my kids.

## How big is too big

Once it was live, I had a doubt. Was it sensible to make a browser download
zone boundaries at all? On a phone app, the files are downloaded once and kept.
On a website, a visitor might come once.

So we measured. Singapore's boundaries are 80 KB. Malaysia's are 510 KB, about
a large photo. Indonesia's are 1.5 MB. Turkey's are 4.7 MB, and 16 MB once
unpacked for the browser to read. That's heavy on mobile data, and slow on a
cheap phone.

Claude Code tried simplifying the shapes, keeping a tenth of the points, and
tested the result against the full files with 3,000 random points per
country. The simpler shapes picked the same district 94 to 99 percent of the
time, with the misses near borders, where a dropdown can correct them. Malaysia
would go from 510 KB to 29 KB.

I kept the full files, at least for now. Partly because that's what the app
already does, so the site and the app agree. And partly because the other way
to make it lighter, looking the location up on a server, means receiving
people's coordinates, and I'd rather not have them if I can help it. Honestly,
it was mostly an arbitrary choice. The download only happens when someone taps
the button, and only for their own country.

## The rest of the world

Then I asked whether the widget did what the app does outside the nine
countries. It didn't. It just said the app works there too.

The app handles the rest of the world by calculating the times on the phone.
It works out your country, picks the calculation method that country's
authorities use (Umm Al-Qura for Saudi Arabia, ISNA for North America, and so
on), and falls back to the Muslim World League's method everywhere else.

The website now does the same, in the browser. It downloads a small map of
the world's countries, 45 KB, only when you're outside the nine. It uses a copy
of the app's table of methods, so the two agree. Claude Code tested it in
London, Paris, Riyadh, New York and Tokyo, and each got the method it should,
with times in line with the published ones.

## The bug in the app

Building that fallback turned up a bug in the app itself.

The world map the app uses comes from [Natural Earth](https://www.naturalearthdata.com),
a free public map dataset. In the app's copy, France didn't have the country
code FR. It had `-99`. So did Norway and Kosovo. The app's method table says
France uses the method of the UOIF, a French Muslim organisation, with Fajr and
Isha at 12 degrees. But because no country was ever FR, that rule never matched, and
anyone in France would have got the Muslim World League's 18 and 17 degrees
instead. For
Fajr and Isha, that's a real difference.

I was surprised that the app had a wrong file at all. Doesn't it fetch its
data from the data repository? Not this file. The zone boundaries come from
the data repository, but the world map is bundled inside the app, so it can
work out your country instantly and offline, before it knows which country's
files to download. It also means a mistake in it can only be fixed with a new
release.

I asked Claude Code to check the original data, not just patch our copy. The
`-99` comes from Natural Earth itself. Its usual country code field has `-99`
for 22 places, including France and Norway, and a newer field has the correct
codes for nine of them. The other thirteen really don't have codes: disputed
areas, a glacier, military bases. The app's file had been built from the older
field.

The fix was nine lines of data, plus a note in the app's documentation so it
doesn't come back the next time the file is generated. It went out with the
app's next release, on 1 October. The website already had the correct codes.

## Since then

The website has kept growing a little at a time. It got a support page, which
the App Store asks for, with the common problems and what to do about them: reminders
arriving late because a phone is saving battery, and widgets that stop
updating for the same reason. It shows dhuha now, where the official
timetables have it. And when Claude Code checked it with Lighthouse on a
phone, it scored 100 for accessibility, best practices and SEO.

It's a small site. But simplesolat now has somewhere to point people, a place
to get help, and a way to check its times against the ones you already trust.
And building it found a bug that would have given anyone in France the wrong
times.
