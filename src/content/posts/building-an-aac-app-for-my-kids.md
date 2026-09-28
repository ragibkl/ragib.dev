---
title: "Building an AAC app for my kids"
description: "When my autistic kids needed a communication app, the good ones cost around USD 200 and the free one had stopped working properly. So I built GibTalk, and their early intervention centre helped shape it."
date: 2026-09-28T20:00:00Z
draft: false
tags: [gibtalk, aac, autism, react-native]
---

My kids were born in December 2017, premature, at 28 weeks. As they grew,
they were diagnosed with autism, with ADHD suspected too. At five, they started
at Permata Kurnia, an early intervention
centre for autistic children here in Malaysia.

At some point, the centre told us to get them tablets and put an AAC app on
them.

## What AAC is

AAC stands for *augmentative and alternative communication*. For a child who
can't yet say what they want, or can't say it reliably, an AAC app is a grid of
pictures on a tablet. Tap *drink* and the tablet says "drink" out loud. Tap
*I want*, then *play*, and it says "I want play". The pictures give them a
voice, and a way to be understood that doesn't depend on speech.

## Shopping around

I did a quick survey, and it wasn't encouraging. iPads are expensive. Android
tablets are much cheaper. And most of the good AAC apps cost a lot, around
USD 200. I learned that many parents wait for a promotion season to buy one,
which means waiting months to give their child a voice because of a price
tag.

I bought Android tablets and tried JABtalk, a free
AAC app. It had most of the features I wanted, but it was clearly showing its
age. Setting it up was clunky. On newer tablets, some features no longer worked
properly. And the one that really mattered to us: the voice followed the
tablet's system language. If the tablet was set to English and I added a
Malay word, it was pronounced as if it were English. It wasn't being maintained any more, so none of that was going to
be fixed.

## How hard could it be?

I'm a software developer, and I'd built mobile apps with React Native before.
So I asked myself a slightly dangerous question: how hard would it be to build
this myself?

It turned out it wasn't that hard.

I started in July 2023. The next day, tapping a word spoke it aloud. Within a
couple of weeks, each word could have its own language, so a Malay word was
spoken in Malay and an English word in English, side by side on the same
screen. That was the thing JABtalk couldn't do for us, and it's still the
feature I care about most. In Malaysia, lots of families mix languages all
the time, and the app should too.

By August, you could search a library of open picture symbols instead of
drawing or photographing everything yourself, or take a photo with the camera
when you wanted something specific, like your own cup or your own car.

I called it **GibTalk**: a play on JABtalk, with the "Gib" from my name,
Ragib.

I built the app on my laptop, installed it on my kids' tablets, and we started
using it ourselves at home, long before anyone else did.

## RM500,000

When it was working well at home, I showed it to the teachers and a speech
therapist at the centre.

The speech therapist told me something I still think about. She had once tried
to get an app like this built for the centre, and had looked for funding. The
quote she got was RM500,000.

I'd had a first version running in about two months, in my spare time.

I don't say that to boast. That quote probably included a lot that a real
project needs and I didn't have to think about. But it shows how out of reach
this kind of tool can feel for the people who need it most, and how much of
that is cost rather than difficulty.

## Working with the centre

I published GibTalk on the Google Play Store, for free, and asked people to
try it. Cost was part of why I'd built it in the first place, and the thing
already existed. I wanted it to be free for everyone.

At first, the centre was understandably careful. A parent turning up with a
free app raises fair questions: why is it free, what's the catch, and would
recommending it be a conflict of interest?

They asked what it would cost to keep running. The honest answer was: very
little. The only running cost is a small server for searching picture symbols,
a few US dollars a month, which I pay myself. That's what lets the app stay
free and open source.

They also asked about privacy, which mattered a lot for an app used by young
children. GibTalk works offline first. There's no account and no login, no
analytics, and no data collected at all. The words and pictures you set up
stay on the tablet.

I offered to hand the app over to them entirely, so it would belong to the
centre rather than to me. But they didn't have a digital team that could own
and maintain an app.

So we worked together informally instead. The teachers helped me build
ready-made word sets for the things the children actually do: greetings,
mealtime, the playground, the outdoor gym, and for our part of the world,
fasting and Hari Raya. Each set comes in both Malay and English, and any
parent can load one in a couple of taps rather than building everything from
scratch.

## Since then

I built a small API of my own for symbol search, and in June 2025, GibTalk
arrived on the Apple App Store too. It's still free, with no ads, and the code
is [on GitHub](https://github.com/ragibkl/GibTalk). As far as I know, the
centre still uses it today.

If you're a parent whose child has just been told they need an AAC app, and
the price made you pause, GibTalk is free on
[Android](https://play.google.com/store/apps/details?id=com.ragibkl.GibTalk)
and [iPhone and iPad](https://apps.apple.com/us/app/gibtalk/id6504814985). It
might be enough. And if it isn't, I'd like to hear what's missing.
