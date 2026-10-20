---
title: "The SSD that never heard about the deleted files"
description: "A 4 TB SSD in my homelab was writing at 1–2 MB/s and running at 70 °C. SMART said it was healthy. The real problem was two missing settings, one in Proxmox and one in Alpine, that meant the drive had never been told about years of deleted files."
date: 2026-10-20T15:51:00Z
draft: false
tags: [homelab, proxmox, alpine, ssd, trim]
---

*Part three of a series about my homelab. [Part one](/writing/from-a-gaming-pc-to-a-homelab/)
describes the machine.*

My homelab has two drives: a 2 TB NVMe that every virtual machine runs on, and
a 4 TB SATA SSD. For years, the SATA SSD belonged to one VM. Proxmox passed
the whole drive through to it, and files were written to it and deleted from
it all the time.

In September 2026, I retired that VM, and the SSD became free. I had
a use for it straight away. I wanted to move my Nextcloud files off a cloud
storage provider and onto my own S3-compatible storage, at home. That's a
story for the next post. This one is about what happened when I first asked
the SSD to do some real work.

## It stopped

Before copying anything, I asked Claude Code to test how fast my connection
could download from the cloud provider, writing to the SSD. Partway through,
the SSD simply stopped completing writes. Commands timed out after three
minutes. Proxmox had to reset the drive's connection, and the filesystem
switched itself to read-only to protect the data.

It recovered, and nothing was lost. But a drive that freezes under a long
write was not a safe home for my Nextcloud files.

The drive's own health report, SMART, said it was fine: no bad sectors, no
wear. It was hot, though. It was sitting at 69 °C, and had reached 78 °C.
Consumer SSDs start slowing themselves down at around 70 °C. And the
filesystem had a recorded error from July 2024, so this may not have been the
first time.

I had no idea. Nothing had ever told me anything was wrong. I only found out
because I'd finally asked the drive to do some real work.

So the obvious suspect was heat. It's a mini PC, after all.

## A careful test

Rather than guess, Claude Code ran a controlled test: write up to 50 GB to
the drive, bypassing the cache, logging the temperature every five seconds,
and stop at once if it reached 76 °C, logged an error, or stalled for 30
seconds. I didn't want the filesystem knocked read-only again.

It stopped the test early. In 15 minutes, the drive had written about 0.4 GB,
**1 to 2 MB/s**, where a SATA SSD should manage 300 to 500. Each 1 MB write
took 17 seconds on average, and up to 40. A healthy drive takes a couple of
milliseconds.

And it was slow from the very first second, at 56 °C. The heat came after. It
climbed to 75 °C while doing almost nothing. So heat wasn't causing the
slowness. Something was making the drive work very hard for very little.

## What TRIM is for

An SSD can't simply overwrite data in place. It writes into empty cells, and
erases old ones later, in big blocks. When you delete a file, the filesystem
only marks the space as free in its own records. The drive doesn't know. It
finds out only when it gets a **TRIM** command, saying "these blocks are
garbage, you can erase them".

Without TRIM, a drive gradually fills up with data that nobody wants but that
it still has to keep. Once it runs out of truly empty space, every new write
means first moving old "live" data out of the way. That's slow, and it's hot.

That drive had never received a TRIM. Two things were missing, one at each
layer:

- **Proxmox:** the passed-through disk didn't have `discard=on`. Without it,
  Proxmox silently drops any TRIM the VM sends.
- **Alpine:** inside the VM, nothing ever sent one anyway. More on that below.

Over the years, terabytes of files had been written and deleted. As far
as the drive knew, it was nearly full of live data.

## The fix

The fix was two options on the disk in Proxmox: `discard=on`, to let TRIM
through, and `ssd=1`, so the VM knows it's an SSD at all. Then a reboot of
the VM, and one manual `fstrim`, which tells the drive about all the free
space at once.

It released 2.9 TB. The drive had been carrying almost three terabytes of
deleted files.

The retest wrote at **300 to 515 MB/s**, with no errors. A few hours later,
the drive was idling at **40 °C**, instead of 69 °C that morning. The heat had
been the TRIM problem all along. The drive had been shuffling data around
constantly, just to stay usable.

## The other drive

The obvious next question was whether anything else had the same problem.

The NVMe was healthy. Every VM disk on it already had `discard=on`, and
Proxmox passes TRIM through to the drive and trims its own filesystems every
week. So the Proxmox side was fine.

The VMs weren't. None of my Alpine VMs ever trimmed anything, so their deleted
files were never released either. It was worst on the Kubernetes workers,
where container images and storage replicas come and go. One worker was using
26 GB, but holding 132 GB on the NVMe. In total, about 300 GB of the NVMe was
taken up by files that no longer existed.

It wasn't slow like the SSD, because the NVMe was only about a third full. It
still had plenty of space it had never used, so it never ran out of empty
cells. The cost was capacity, and it would only have grown.

## Why Alpine doesn't do this

I asked why this wasn't the default, and how other systems handle it.

Most Linux distributions ship a weekly trim timer and turn it on: Ubuntu,
Debian, Fedora. Windows has trimmed weekly since Windows 8. Arch ships the
timer, but leaves it off. Alpine ships `fstrim`, but nothing that runs it.
That's by design. Alpine is minimal, and nothing runs unless you set it up.
It also uses OpenRC rather than systemd, so there's no timer to ship.

The other way is the `discard` mount option, which trims on every delete. It
isn't the default anywhere, because it can slow deletes down, and some drives
have had bugs with it. A weekly batch trim is the usual answer.

## Rolling it out

There were two ways to fix the VMs. Proxmox could trim every VM from the
host, through the guest agent they all run. Or each VM could trim itself. I
chose the second. I like to keep the Proxmox host as close to stock as I can,
so each VM is responsible for its own trimming. And all my Alpine VMs are
built from one setup script, so a weekly job in that script covers every new
VM. The existing ones just needed the same file added.

The rollout failed twice, quietly. Alpine's built-in `fstrim` is the tiny
BusyBox version, which can't trim all filesystems at once. So the first
attempt ran on every VM, and did nothing. The package Claude Code installed
to fix that turned out not to contain `fstrim` either, because Alpine splits
its tools into many small packages. The right one is simply called `fstrim`.

Neither failure made a sound. Claude Code only noticed because the first
runs reported trimming zero bytes everywhere, which didn't add up.

The third attempt worked. The first real run gave back **267 GB** of the
NVMe: the shared pool went from 34% to 19% full. The storage volumes inside
Kubernetes were trimmed too, since they're mounted on the workers.

## What I check now

If you run Proxmox, two things are worth checking:

1. **Every VM disk on an SSD or thin storage has `discard=on`**, passed-through
   disks included. Add `ssd=1` while you're there.
2. **Something inside each VM actually trims.** On most distributions, a
   timer already does. On Alpine, add one. And check that it works: run
   `fstrim -v` by hand and look at the numbers. A trim that silently trims
   nothing looks exactly like one that worked.

What stays with me is how quiet all of it was. The drive's health report was
clean. Nothing logged an error until the drive froze. And the first fix
failed without a word. A missing setting doesn't break anything on the day
you forget it. It just waits.
