---
title: "From a gaming PC to a homelab"
description: "How my homelab came to be: a university gaming PC turned home server, a few years in the cloud, two mini PCs running Proxmox, and why it's now split into separate private networks, one of them for a friend."
date: 2026-10-10T14:56:00Z
draft: false
tags: [homelab, proxmox, alpine, networking]
---

*The first part of a series about my homelab. [Part two](/writing/hosting-from-home-without-a-public-ip/)
is how it's reached from the internet, and [part three](/writing/the-ssd-that-never-heard-about-the-deleted-files/)
is a drive that went wrong without a sound.*

Around 2010, in my second year at university, I had some spare cash, and I
spent it on a gaming PC. An ASUS board, a Core 2 Quad Q9550, 8 GB of DDR2,
and an NVIDIA GTX 285, in a big case. It came to about RM 3,000, maybe a bit
more. I even tried liquid cooling, for both the processor and the graphics
card.

I gamed on it a lot, until new games stopped running well. By then I used a
laptop for university anyway, so the PC needed a new job. That's how I started
with home servers.

## Every experiment was a reinstall

I tried a few home server distributions, ClearOS among them. The trouble was
that every new idea meant a reinstall, and every reinstall meant sitting in
front of the machine. I'd used VirtualBox on Windows before, so I knew what
virtual machines could do. What I wanted was a server whose only job was to
run them. [Proxmox](https://www.proxmox.com) looked like the right tool, and
it's what I came back to.

That PC didn't last forever. One day the liquid cooling pump stopped spinning,
so I went back to air cooling, and swapped the GTX 285 for a cheap graphics
card. That was another lesson. Liquid cooling is hard to maintain and keep
clean, and it's more parts that can fail. For a machine that runs all the
time, a good air cooler is enough.

Then, during my first job, it stopped booting altogether. I sold its
memory and power supply to friends, as parts.

## A few years in the cloud

I don't remember exactly what came next. Mostly virtual servers, I think, a
Kubernetes cluster in the cloud, and Raspberry Pis for small projects at home.
For virtual servers I liked [Scaleway](https://www.scaleway.com), which gave
the most memory for the price.

The Raspberry Pis taught me something too. Most of what I run is in Docker,
and most images are built for ordinary x86_64 PCs. Very few were built for
the Pi 2's ARM processor, so I kept hitting things that wouldn't run. And
the Pi's SD card was easily corrupted when the power went out. Whatever came
next had to be x86_64.

What brought me back home was cost, and wanting to learn. A Kubernetes cluster
in the cloud gets expensive, and for the same money, I could buy a machine
outright, with far more memory than I'd ever rent.

## Two mini PCs

By then I knew what I wanted from the next machine. It had to be x86_64,
because of the Pi. And it shouldn't be a tower, because of the gaming PC. A
tower is heavy, takes up space, and is noisy. A mini PC sits high on a shelf
next to my router, and takes no space at all. A mini PC could also take 64 GB
of memory by then. A desktop board might have taken twice that, but not
enough more to be worth the space and the noise.

In April 2022, a Minisforum HX90 arrived, for about USD 630. I put Proxmox on
it, then Rancher, with [Longhorn](https://longhorn.io) for storage, and ran
everything as one Kubernetes cluster on my home network.

In April 2023, the HX90 died too. It just wouldn't boot. So I bought an ASRock
mini PC kit and a Ryzen 7 5700G, and moved the memory and disks across. That's
still the machine today: eight cores, 64 GB of memory, a 2 TB NVMe drive and a
4 TB SATA SSD, in a small box. Proxmox didn't even need reinstalling. It came
along with the disks.

## One cluster, two owners

For a long time, that one Rancher cluster ran everything: my own things, and
also the website of an organisation I belong to.

There's another technical person there, a friend, and I wanted to give him
access to their part, safely. Not just the cluster, but the virtual machines
too, and SSH access to log in to them. With everything on one cluster and one
home network, anything I gave him would sit right next to everything of mine.

So at the end of 2025, I split the server into separate private networks, the
way a cloud provider gives each customer their own private network. Proxmox
calls its virtual switches bridges. `vmbr0` is my home network. `vmbr1` is a
private network for my things, and `vmbr2` is one for my friend's. The two
private bridges aren't connected to any physical port. If you have a single
Proxmox machine, this is an easy place to start: a bridge with no port is a
private network, like a cloud provider's, for free.

Each network got its own copy of everything, down to its own Git repository
that Flux deploys from. My friend got the whole of his network's cluster. In
practice, he doesn't use it much. He mostly looks at things through the
Kubernetes web dashboard. But the line is there, and it's in the right place.

It was also practice. I wanted to learn how to split one Proxmox host the way
a cloud splits its customers. And I think keeping virtual machines in private
networks is good practice anyway, even with only one person using them.

More networks meant more servers to log in to, and more people who might need
to. So that was also when I wrote a small script that gave every server the
SSH keys of the GitHub accounts listed for its network. It has since become
[keytree](/writing/keytree-ssh-keys-from-one-file/): one file in a repository
that says who can log in where. Adding or removing someone is a one-line
change, and it's made the whole setup much easier to manage.

## Scripts instead of clicking

Until then, I'd built every virtual machine by hand. With the split, I was
about to build a lot of them, so I wanted that to be easy. This was around the
time AI tools got really good, and I built most of it with
[Claude Code](https://claude.com/claude-code).

On 27 November 2025, I started a repository called `homelab-vm`: a few small
shell scripts per kind of machine. A common one sets up any VM. Others turn it
into a router, a VPN server, a Kubernetes node, or an ingress proxy. Within a
week, the routers and VPN servers were rebuilt from them, and by mid-December,
the Kubernetes clusters.

Almost all of them run [Alpine Linux](https://alpinelinux.org). I was curious
about it, its installer is quick, and it's light. Most of what I run is in
Docker, and getting Docker working on Alpine was easy.

## The shape of it

Each private network has the same few essentials.

**A router.** A small VM that sits on `vmbr0` and on the private network. It
hands out addresses inside, and gives the network its way out to the internet.
It only works one way: nothing on my home network can reach in. The one
exception is my own SSH key, which can hop through the router to get inside,
and I use it sparingly.

**A way in from the internet.** My home connection has no public IP address I
can use, so each network has a small virtual server in the cloud, and a tunnel
that the cluster opens out to it. Visitors connect to the cloud server, and
their traffic comes down the tunnel. More on that in a later post.

**A VPN.** An OpenVPN server per network, so I can get inside it when I'm away
from home, and my friend can get into his.

**A Kubernetes cluster.** Three VMs: one server and two workers, running
[k3s](https://k3s.io). k3s is much lighter than the Rancher setup I had before,
which matters when every cluster has to fit in the same 64 GB. Rancher also
didn't fit the new shape. One Rancher server managing both clusters would have
needed a path between the two private networks, and one Rancher server per
network would have cost memory I'd rather give to the clusters. I wanted to
open as few holes as possible, and keep it simple.

Not everything runs in Kubernetes. Some things are happier in a VM of their
own. Those don't need a way in of their own, because they share the cluster's.
The cluster's web proxy, ingress-nginx, forwards their traffic to the VM by
name, using [nip.io](https://nip.io). It's a free DNS service where a name
with an IP address in it resolves to that address: `app.192.168.1.50.nip.io`
is simply `192.168.1.50`. So the cluster can point at a VM by name without me
running any DNS for it. One way in from the internet per network, and
everything behind it.

## What it costs

The split isn't free. Every private network repeats the same pieces. The
router and the VPN server are small, half a gigabyte each. The cluster isn't:
4 GB for the server and 8 GB for each worker, so a network needs about 21 GB
before it runs anything of its own. Two networks take two thirds of the 64 GB.
On a machine like this, memory runs out long before the processor does, and
that's the limit I plan around.

Each network's way in also costs money. Its cloud server is the smallest one
my provider sells, one processor and 1 GB of memory, for about USD 5 a month.
That's small, but it's per network, every month.

For me, that's a fair price for keeping my friend's things and mine apart. If
you only ever have yourself to think about, one private network is probably
enough.

It's a long way from a liquid-cooled gaming PC. But the idea hasn't changed
since that first reinstall: one machine, running as many experiments as it can
hold, without me having to sit in front of it.
