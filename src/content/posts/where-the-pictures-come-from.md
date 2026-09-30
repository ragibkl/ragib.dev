---
title: "Where the pictures come from"
description: "GibTalk's symbol search started by borrowing other people's servers. Why I ended up hosting the pictures myself, why their web addresses can never change, and how Claude Code taught the search what's in each picture."
date: 2026-09-30T06:40:00Z
draft: false
tags: [gibtalk, aac, rust, claude-code]
---

*This is part three of the GibTalk story. [Part two](/writing/starting-from-jabtalk/)
is what I kept from JABtalk and what I changed.*

Every word on a GibTalk board is three things: a label, a language, and a
picture. The label and the language are a few bytes each. The picture is
usually a web address, pointing at a symbol on a server somewhere.

That address doesn't stay in the app. It's saved on the tablet, written into
every backup, copied into every template, and passed from one family to
another when they share a board. Once it's out there, it's out there. It took
me a while to understand what that means, and this post is mostly about how I
learned it.

## Borrowing

The first pictures in GibTalk weren't mine. On its second day, the sample
words on the screen were already pointing at symbols on senteacher.org. SEN
Teacher has been online since 1999, offering free printables and tools for
special needs teaching, including an AAC symbol search.

When I added symbol search to the app in August 2023, I pointed it there too.
The app sent the same request as the search form on the site, with three
switches turned on, one for each symbol library it searched: ARASAAC,
Tawasol and Mulberry. It was only meant as a test, to see whether search
inside the app was worth having. It was. The first templates I wrote pointed
at senteacher.org as well.

Then the requests started failing, and the site's API changed. I suspect its
admin had noticed a stream of requests from an app nobody had asked them
about, and I can't blame them. I'd been using someone else's server without
asking.

In September I switched to opensymbols.org, a collection of open symbol
libraries run by the team behind CoughDrop, another AAC app, with a documented
API for exactly this. It returned good results, but some of the symbols were SVG
files, which the app couldn't use as they were. My workaround was to draw the
SVG on screen and take a screenshot of it when you tapped it, then use the
screenshot as the picture. It worked, and I didn't like it. I wanted a source
that only ever gave me PNGs.

I also wanted permission. On 12 October 2023 I emailed CoughDrop: I was a
software engineer in Malaysia, building an AAC app mostly for Malaysian
families, non-commercial, completely free, no ads and no strings attached, and
I'd like to use the OpenSymbols API in it. Was there a way to make that happen?
I never got a reply. So once again, GibTalk was relying on a service without
anyone's permission.

## A server of my own

Nine days later, on a Saturday, I wrote my own. The first version was about
sixty lines of Rust, using Axum. It did two things: search the symbol files by
name, and serve them.

The pictures came from the same three libraries I'd first been borrowing
from: ARASAAC, Mulberry and Tawasol, all free and openly licensed. I
downloaded them, converted what wasn't PNG into PNG, downsized them, and put
them straight into the Docker image, about fifteen thousand files in the
first commit. There's no database. The server keeps nothing and remembers
nothing, and the whole service is one image that can run anywhere.

I had three reasons for doing it myself. The first was what had just
happened with senteacher.org. A service I didn't run could change or go away
whenever its owner decided, and GibTalk would break with it. And I'd now been
calling two of them without explicit permission, which I wasn't comfortable
carrying into an app that other families relied on.

The second was speed. Search sits
between a person and the word they're trying to add, and every picture on a
board has to load before a child can use it. I wanted that to be fast, and to
stay fast, without depending on anyone else's server.

The third reason was those addresses. Once a picture's address has been
saved on a family's tablet, I can't change it. The app can't reach into
people's boards and rewrite them, and I can't make everyone reinstall. If the
server behind an address disappears, the picture just goes blank, on a board
a child depends on.

So I made one rule: an address, once handed out, has to keep working. The
server started life as `api-gibtalk.apps.bancuh.net`. By June 2024 it had a
second name, `api.gibtalk.ragib.my`, which is the one it gives out now. Both
still work, and both will keep working, because there are boards and
templates out there that use each of them.

Over the next few months a small folder of extra pictures joined the
libraries, for the templates we were building with the teachers: ketupat,
kuih raya and baju raya for Hari Raya, and *my turn* and *your turn* cards for
play. Those are all served from the same image, under addresses that won't
change either.

## Search that only knew file names

The search in that first version was simple to the point of being naive. It
looked for the words you typed in the file names, and sorted the matches by
how similar they were. It only worked as well as the names did.

Some names were fine: `apple.png` is an apple. Many weren't. A symbol's file
name is whatever its library happened to call it, sometimes with a number or
an odd suffix, and it rarely says what a picture is *of*, let alone what else
someone might call it. Search for *cookies* and you'd get pictures with
"cookie" in the name. You'd never find *kuih raya*, even though for a
Malaysian child, that's exactly what the cookies on the table are at Hari
Raya.

In February 2024 I also put the search on a small web page, so it could be
used from a computer as well as from the app. It had the same limits.

For a long time, that was good enough. Fixing it properly meant describing
what's in about sixteen thousand pictures, and that wasn't something I was
ever going to do by hand.

## Teaching the search what's in each picture

In April 2026 I came back to it with Claude Code.

First, the search changed shape. Instead of looking at files on disk, the
server now loads a list of every symbol when it starts, each with a name and
a set of tags, and scores matches against both. The list lives in plain YAML
files next to the pictures, one per library, so the server still has no
database and the pictures and their descriptions ship together in the same
image.

Then came the tags themselves. Claude Code looked at every picture, library by
library, and wrote a short list of words for what's in it and what someone
might search for. It ran as batches of agents using Claude Sonnet, each
working through a range of file names. Tawasol and the custom pictures came
first, then Mulberry, then ARASAAC, by far the biggest, which was finished in
May. A few batches failed on images too big to look at and had to be run
again.

It wasn't quick, and it wasn't free either, though the cost was mostly in
time. I did it on the Claude Max plan, USD 100 a month, which I was already
paying for and using every day. It took several sessions over a number of
days, in April and again in May, and each one ran until it hit the plan's
usage limit. Then I waited for the limit to reset and carried on. The real
cost was that, on those days, I couldn't use Claude for anything else. By the end, every picture had tags. An
acorn looks like this:

```yaml
- name: acorn
  file: acorn.png
  tags: [acorn, nut, seed, oak, tree, nature, autumn, fall, green, yellow, food, squirrel, forest, plant]
```

Now a search for *cookies* finds kuih raya. There's a test in the repository
that checks it.

It isn't perfect. The tags are a model's description of a picture, and some
of them are a stretch. Ranking still needs work too: when several symbols
match equally well, the order isn't settled yet. But the difference between
searching file names and searching for what's actually in a picture is large,
and it's the kind of improvement I'd never have found the time to make on my
own.

## The last borrowed pictures

This week I went back to the beginning. One old template was still loading
fourteen pictures from senteacher.org, nearly three years after I'd stopped
using it. With Claude Code, I matched each one against the symbols on my own
server by comparing the images pixel by pixel. Eight were byte-for-byte the
same file. The rest were the same drawings, a couple of them in ARASAAC's
newer colouring. Now the template pointed at my server.

Then we noticed nothing in the app actually loaded that template any more,
and deleted it. But no GibTalk template depends on someone else's server now.

The same week, the search got a proper home at
[gibtalk.ragib.dev/symbols](https://gibtalk.ragib.dev/symbols/), with the free
API documented for anyone who wants to use it in their own project. That page
also credits the three libraries and their licences. None of these pictures
are my work. ARASAAC, Mulberry and Tawasol were drawn by other people and
shared freely, and GibTalk exists in the form it does because they did.

## Looking back

The pictures taught me something about building an app for other people that
I hadn't thought about at the start: some decisions leave the app and never
come back. Where a picture lives is one of them. It took two borrowed sources
before I settled on my own, and the first address I chose is one I'll be
keeping for as long as anyone's board still uses it.

The next post is the least about code: what it's been like to live with GibTalk, at home and at the centre,
and what I'm hoping the teachers will do with the tools I've built for them.
