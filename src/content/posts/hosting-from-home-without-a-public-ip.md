---
title: "Hosting from home without a public IP"
description: "How my homelab's websites reach the internet through a small cloud server and an frp tunnel instead of my home connection: why, how the pieces fit, and the house move it made painless."
date: 2026-10-10T16:12:00Z
draft: false
tags: [homelab, frp, haproxy, kubernetes, networking]
---

*Part two of a series about my homelab. [Part one](/writing/from-a-gaming-pc-to-a-homelab/)
is how it came to be.*

For years, getting my homelab onto the internet was simple. My home internet
is Unifi, and on a high enough plan, you get a public IPv4 address. So I
forwarded ports 80 and 443 on my home router to one of my Kubernetes worker
nodes, pointed my domains at my home address, and that was that. Every plan
gets a public IPv6 address too, but it isn't stable. It rotates, so I couldn't
rely on it.

It worked for me. But I kept thinking about everyone it wouldn't work for.

## The problem with hosting at home

In June 2024, I wrote it down, in the README of a small repository where I was
trying out a different way:

> You need an internet connection with a public home IP address. Not all ISP
> will provide this. Some ISPs will provide a public ipv6 but you'll have to
> pay more for a public ipv4.

Even with one, home addresses usually change whenever the router reconnects.
You can update your DNS records automatically, but there's still downtime
while the old records expire. And you only get one IPv4 address for every
service you want to expose.

The alternative is to borrow someone else's public address. You rent a small
virtual server in the cloud, which has public addresses that don't change, and
point your domains at it. Then a program at home opens a tunnel out to that
server, and the server sends visitors down the tunnel. Your home connection
never needs to accept a connection from outside at all. It only makes one,
outwards.

## rathole or frp

There's a [list of tunnelling tools](https://github.com/anderspitman/awesome-tunneling)
on GitHub, and I tried two of them,
[rathole](https://github.com/rapiz1/rathole) and [frp](https://github.com/fatedier/frp),
side by side. My notes at the time:

> In my testing, frp seems to be more stable and consistent. With rathole, the
> tunnel connection seems to get dropped with time, and will not maintain a
> stable server endpoint.

So it was frp. Getting it working wasn't easy, though. The latest version
didn't work for me, maybe because the documentation hadn't caught up with it.
A few versions older, it did.

I didn't try the hosted options, like Cloudflare Tunnel or ngrok. I prefer to
self-host where I can. And frp fitted what I already had.

## How the pieces fit

On the cloud server, two programs run side by side. haproxy listens on ports
80 and 443, where visitors arrive. It passes each connection, untouched, to
frps, the frp server. At home, frpc, the frp client, keeps a connection open
to frps, and connections come back down it to my cluster.

The tunnel only carries raw TCP. It doesn't know or care about websites. The
HTTPS connection goes all the way to ingress-nginx, the web proxy in my
Kubernetes cluster, and that's where the certificate is, and where the request
is routed to the right site. I was already used to doing it there. So adding
a new site is just another Ingress resource in the cluster, and the tunnel
doesn't need to know about it.

One thing gets lost in a tunnel: who the visitor is. To ingress-nginx, every
connection seems to come from the tunnel. So haproxy adds a small header to the
start of every connection, using the
[PROXY protocol](https://www.haproxy.org/download/2.0/doc/proxy-protocol.txt),
saying where it really came from. ingress-nginx reads it, and the sites see the
visitor's real address.

The cloud server itself runs no firewall. The provider's firewall sits in front
of it instead, and only lets through what the tunnel needs.

## Moving house

The best test of it wasn't planned.

When I moved house, I wanted to take the server with me, but the new house
didn't have internet yet. So I took my Wi-Fi router over first, and gave it
internet by USB tethering from a spare phone on 5G mobile data. No public IP
at all.

Then I brought the server over and switched it on. It connected to the same
router, the tunnel came up from the new house, and everything was back. My
domains still pointed at the cloud server, and nothing there had changed. The
only downtime was the move itself.

With port forwarding, that wouldn't have worked at all. A phone on mobile data
has no public address you can forward to.

## Where the client lives

Where frpc runs changed a few times. I was just experimenting with what could
work.

At first, I ran a copy on every Kubernetes node, which mimicked how port
forwarding worked before: traffic arriving at a worker node's ports.

When I [split the server into private networks](/writing/from-a-gaming-pc-to-a-homelab/),
I moved it into the network's router VM. I thought it was best to consolidate
everything that needed a tunnel, the VPN as well as the websites, onto one VM.

Then I realised I didn't need to. frps accepts many clients at once. So now
the VPN server runs its own small frpc, just for the VPN, and the cluster
runs one frpc, as an ordinary deployment, that sends web traffic straight to
ingress-nginx. Each piece brings its own tunnel, and nothing else has to know
about it.

Each private network has its own cloud server and its own tunnel. It's
[about USD 5 a month](/writing/from-a-gaming-pc-to-a-homelab/) each.

## If you don't have a public IP

This setup is for anyone who wants to host something at home and can't, or
would rather not, open their home connection. A small cloud server, haproxy,
and frp at both ends. The cloud server is the only thing on the internet, your
home makes only outgoing connections, and your home address can change as
often as it likes. Even to a phone in a new house.
