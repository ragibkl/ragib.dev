---
title: "Starting from JABtalk"
description: "GibTalk didn't start from a blank page. I kept the parts of JABtalk that worked for us, changed the ones that didn't, and then a parent's Play Store review showed me what I'd missed."
date: 2026-09-30T03:30:00Z
draft: false
tags: [gibtalk, aac, autism, react-native]
---

*This is part two of the GibTalk story. [Part one](/writing/building-an-aac-app-for-my-kids/)
is why I built it.*

In the last post, I said building an AAC app turned out not to be that hard. Part of the reason is that I didn't
have to invent one. JABtalk was already on my kids' tablets. It had stopped
being maintained and it was showing its age, but it had most of what I wanted,
and I knew it well from using it. So GibTalk started as a list: what to keep
from JABtalk, and what to do differently.

## The first weekend

I started on a Saturday morning in July 2023, and got properly going that
night. By midnight there was a grid of words on a screen, locked to landscape.
Tapping a word added it to a sentence
strip along the top, and a trash button cleared it.

Just after one in the morning, the tablet spoke for the first time. It was
Expo's text-to-speech reading out whatever word I tapped, nothing clever, but
it was the moment the thing became an AAC app rather than a grid of buttons.

On Sunday afternoon I added Malay words, and a long press on a word opened an
editor. By the next day I'd tried a word in Chinese too, just to see that it
worked.

## What I kept

The first thing I copied from JABtalk was its shape. Words live in folders,
and folders can hold more folders, so *food* can open into *fruit* and
*drinks*, and a child can find their way down to *apple* in a few taps. That
tree has been the core of GibTalk ever since.

The second was a small thing that matters a lot at home: a gate in front of
editing. Children are quick to discover that a long press does something
interesting, and a board that a child can rearrange or delete by accident isn't
much use the next morning. JABtalk asked for a code before you could edit, and
so does GibTalk. It shows a random four-digit number and asks you to type it
in. Easy for an adult, and enough to keep small hands out.

The third was backup and restore, and this one was personal. We had two
tablets, one for each child, and I wanted the same board on both. In JABtalk
I did that by backing up one tablet and restoring on the other, when it worked.
So GibTalk had backup and restore within its second week.

## What I changed

The backup was where I first went my own way. JABtalk's backup was a file only
JABtalk understood. I wanted one I could open in a text editor, change by hand,
and send to someone else, so GibTalk's backup is a YAML file: a readable list
of words, each with its label, its language, its picture, and any words inside
it.

That turned out to matter more than I expected. A file you can edit by hand is
also a file you can prepare in advance. In August 2023 GibTalk learned to load
a *template*, a ready-made word set in the same format, from a list published
alongside the app. Later, the teachers at Permata Kurnia helped me build the
templates for mealtime, the playground and Hari Raya that I wrote about last
time.

Those templates were really for the teachers. They know which words a child
needs for the playground or for mealtime far better than I do, and a template
put that knowledge on every tablet that loaded it. If the parents at the centre
used boards the teachers had built, then home and the centre were working from
the same words and pictures, which made it much easier to coordinate. All of
that grew out of wanting a backup file I could read.

The second change was the voice. JABtalk's text-to-speech spoke every word
in the tablet's language, which was usually English, and for some parents
Indonesian. Either way, Malay words didn't sound right. The workaround was
another JABtalk feature, recording your own audio for a word, and some teachers
did exactly that for the Malay words: recording them one by one.

That problem wasn't really about Malay. Malaysia is multicultural, and many
households don't live in one language. At home we mix English and Malay. Other
families mix in Tamil or Chinese, or something else again. An app that assumes
English, or any single language, doesn't serve those families well, however
good it is otherwise. I wasn't trying to build a Malay AAC app. I wanted one
that worked for Malaysian parents, whatever mix of languages they speak.

So in GibTalk, every word carries its own language. A Malay word is spoken in
Malay and an English word in English, side by side on the same board, and
Chinese and Tamil were among the first languages on the list. That removed most
of the need for recordings, and with it a lot of effort for the people setting
up the boards. It was the feature I wanted most.

The third was pictures. JABtalk's way of finding one was to open Google Image
Search in a browser, which never fitted into the app well. I wanted search
inside GibTalk itself, returning simple, consistent symbols of the kind AAC
boards use. That arrived in August 2023, along with taking a photo with the
camera for things that have to be exactly yours, like your own cup. Where those
symbols come from turned out to be a longer story than I expected, and it gets
a post of its own next.

By then GibTalk also had a keyboard screen, for typing a word that isn't on the
board and hearing it spoken, and it was on the Play Store for anyone to try.

## A review on the Play Store

In September 2023, a review came in, in Malay. In English, it said roughly this:

> Very easy, and I like using this app for my autistic child. It has many
> languages, and the easiest is Malay. My child can repeat all the words. But
> I have a problem with my tablet. Once I've saved a lot of pictures, the app
> can't cope any more. Everything I saved disappears when I clear history or
> turn the tablet off and on. I had to save it all again and pin the app. But
> my child is clever: they turn the tablet off and get back to the home screen.
> Then what I saved is gone. Can you help me with this?

A parent was using GibTalk with their child exactly as I'd hoped, and their
child was repeating the words. And the app was throwing away their work, again
and again, while they tried everything they could think of to hold on to it.

The cause was a decision I'd made in the first week without thinking much
about it. GibTalk kept the whole board as one value in React Native's
AsyncStorage, a simple key-value store, and each picture was stored inside it
as text. On Android that store has a limit of about 2 MB. A board with a lot
of photos went over it, the save failed, and the next time the app started,
there was nothing to load. My own boards had never grown big enough to hit it.

In October I first made the app say so when a save or a load failed, instead
of failing silently. A week later, GibTalk stopped using AsyncStorage
for the board and wrote it to a file instead, which has no such limit. Existing
installs still had their data in the old store, so the app reads from there
when the file isn't there yet.

I replied to the review, also in Malay: older versions had a problem storing
data, anything over 2 MB was lost, and updating to the latest version should
remove the limit. It was a short reply to a long, patient review. The lesson
was a plain one: an app for children has to survive children, and they will
switch the tablet off.

## Other parents, and the teachers

By early 2024, GibTalk was being used by more parents at Permata Kurnia and by
the teachers there. In February I wrote up a batch of improvements as GitHub
issues: some were requests from those parents and teachers, some were my own
ideas from using the app at home. I worked through most of them that same
week.

Loading a template replaced your whole board, which was fine for a new tablet
and alarming for one you'd spent weeks on, so templates now merge into what's
already there. You can copy a word or a folder and paste it somewhere else. The
screen no longer goes to sleep while the app is open, because a tablet that
locks in the middle of a sentence is one more obstacle between a child and
what they want to say. Pictures that fail to download on a patchy connection
now retry by themselves. And a row of breadcrumbs at the top shows which folder
you're in and takes you back up in one tap.

One fix was about how GibTalk sounded. It used to speak a sentence one word at
a time, with a small pause between each, so "I want to play" came out as four
separate words. Now words in the same language are spoken together as one
phrase, and it only switches voice where the language changes.

Some requests are still open. A few families found that a word set to a
particular language wasn't spoken in that language at all. On my tablets it
always worked, because they came with voices for several languages already
installed; on theirs, the voice pack simply wasn't there, and nothing in
GibTalk told them. I still haven't found a good way to help with that from
inside the app. Bigger pictures, for children who need them, are on the list
too.

## Looking back

Very little in GibTalk's first year was original. The folders, the passcode and
the backup came from JABtalk. Most of the improvements came from parents and
teachers who told me what was getting in their way. My part was mostly
listening, and choosing a few things to do differently: a file you can read,
a voice for each language, and pictures you can find without leaving the app.

Those pictures are where the next post picks up. Every word on every board
points at a picture on a server somewhere, and for the first few months, that
server wasn't mine.
