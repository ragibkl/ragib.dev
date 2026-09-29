---
title: "Letting my servers fetch their own SSH keys"
description: "For years I copied SSH keys onto every server by hand, and carried my private key from laptop to laptop. A shell script fixed some of that. keytree fixed the rest, by turning the whole thing around."
date: 2026-09-29T20:00:00Z
draft: true
tags: [ssh, homelab, go, keytree]
---

For most of the time I've run servers, getting SSH access to them worked the
way it does for most people. When I set up a new server, I ran `ssh-copy-id`
to put my public key on it. And when I got a new laptop, I copied my private
key over from the old one, because the alternative was visiting every server
and adding a new key.

That second part is the one you're told not to do. A private key is meant to
stay on the machine it was made on. But with a handful of servers, carrying
the key along was simply the easy option, and I took it.

## A friend, and a fresh batch of servers

In November 2025, two things happened at once. I was rebuilding my homelab
as a set of fresh virtual machines, and I wanted to set up a separate cluster
for a friend: hosting for a silat (Malay martial arts) organisation's website,
which I also help maintain. My friend needed to be able to log in to it.

Adding their key by hand to each machine, and then remembering to remove it
later, didn't appeal. But GitHub already publishes everyone's public SSH keys:
`github.com/<username>.keys` returns them. If my servers could read those,
nobody would ever have to copy a key again. A new laptop would just mean
adding its key to GitHub. And since I was building new machines anyway, it was
good timing to try.

## Version one: a script at login

SSH has a feature for exactly this. Instead of reading keys from a file, the
SSH server can run a program, `AuthorizedKeysCommand`, and use whatever keys it
prints. So I wrote a shell script, `github-keys.sh`, and pointed SSH at it.

When someone tried to log in, the script looked at the machine's hostname to
work out which network it was on, downloaded that network's list of GitHub
usernames from my homelab repository, fetched each person's keys from GitHub,
and printed them. To avoid hitting GitHub on every login, it cached the result
for an hour.

It worked, and it was a real improvement. But it had a few problems I only
saw properly later:

- **The cache lived in `/tmp`**, which is wiped on reboot. If a server
  restarted while GitHub or my internet connection was down, it came back with
  no keys at all, and nobody could log in until the network returned.
- **Access was all or nothing.** Everyone on a network's list got root on
  every server in that network. There was no way to say "this person, only on
  that machine".
- **It only covered the homelab.** My other servers, including the Bancuh
  DNS machines, still had keys added by hand.

## Version two: turning it around

In September 2026 I decided to take the idea out of my homelab scripts and
make it a small program of its own, one that solved the problem properly
enough that other people could use it too. I built it with
[Claude Code](https://claude.com/claude-code), and called it
[keytree](https://github.com/ragibkl/keytree).

The biggest change was the direction. Instead of the SSH server asking a script
for keys at the moment someone logs in, each server now **pulls** them on a
schedule. Once an hour, keytree reads one shared file, works out who should be
able to log in to this machine and as which account, fetches their keys from
GitHub, and writes them into the account's `authorized_keys`. Logging in no
longer depends on anything being reachable. If GitHub is down, the server
keeps the keys it already has, and it only ever removes someone when the file
says so.

The file got a proper design, too. It lists people and groups once, and then,
for each server or pattern of servers, which accounts they can use:

```yaml
users:
  ragib:
    github: ragibkl
  friend:
    github: their-username

groups:
  admins: [ragib]

servers:
  "vmbr1-*":          # every server whose name starts with vmbr1-
    root:
      groups: [admins]
  "vmbr2-*":          # the friend's cluster
    root:
      groups: [admins]
      users: [friend]
```

keytree only edits the lines between its own markers in `authorized_keys`, so
any keys I'd added myself, including an emergency key, stay exactly as they
are. And if a key needs to go without removing the person, say for a lost
laptop, it can be blocked on its own by its fingerprint.

## The part that needed the most care

A program that runs as root and writes into other people's `authorized_keys`
is exactly the kind of thing that can go badly wrong. So most of the effort
went into tests for the risky part:

- thousands of randomised cases checking that editing the managed block never
  touches anything outside it, and can be undone cleanly,
- attempts to trick it with symlinks, including one pointing at a stand-in for
  `/etc/shadow`, which it must refuse without touching anything,
- a crash halfway through writing a file, which must leave the old file
  intact,
- and a fake GitHub that times out, errors, or returns an HTML page instead of
  keys.

Then the end-to-end tests install it in real Alpine and Ubuntu containers and
log in over SSH: the right key gets in, the wrong one doesn't, and a revoked
key stops working.

A couple of small decisions came from how I actually set up servers. The
installer is a single short command that I can type by hand on a server's
console, because a fresh VM often has no copy and paste. And it takes the full
URL of the config file rather than a short "owner/repo" form, which looked
too much like "allow this user" to be safe.

## The rollout

Over two days I moved 21 servers to keytree: my homelab machines, two small
VPSes, and all seven Bancuh DNS servers. The one thing I was careful about was
the order. The old script fetched its user lists at login time, so I couldn't
delete those lists until the very last machine had switched over. Deleting
them early would have locked out any server still on the old script the next
time it rebooted, which was, fittingly, the old script's weakness.

The first payoff came the very next day. The Bancuh DNS servers had never had
the keys I use for development work, and now they did. That let me roll out a
long-overdue security fix to all seven of them, one at a time.

## Looking back

The first version was a script that did its job for my homelab. The second one
is a program that solves the same problem for anyone, and the main difference
between them isn't the language. It's that I finally turned the problem
around: instead of each login asking "who's allowed in?", each server keeps
its own answer up to date, and never throws it away just because the internet
is having a bad day.

These days, a new laptop means adding one key to GitHub. So does giving a
friend access. And there's no longer any reason to carry a private key from
one laptop to the next.
