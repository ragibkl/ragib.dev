---
title: "Why I migrated from Fedora Kubernetes to Alpine k3s"
date: 2026-05-21T00:00:00+00:00
draft: true
tags: ["kubernetes", "k3s", "alpine", "fedora", "homelab"]
categories: ["infra"]
summary: "Notes on swapping a Fedora-based Kubernetes setup for k3s on Alpine — what I gained, what I gave up, and what I'd do differently."
---

> Draft — fill in the story.

## The setup I was running

<!-- Describe the previous Fedora + kubeadm (or whatever) cluster: node count, hardware, what it was hosting. -->

## What pushed me to switch

<!-- Resource overhead, update cadence, ostree quirks, anything that made it feel heavier than it needed to be. -->

## Why k3s on Alpine

- **Single binary** — control plane and kubelet in one process.
- **Smaller base image** — Alpine + musl keeps each node lean.
- **Less to babysit** — no separate etcd, no kubeadm dance.

## The migration itself

<!-- Steps taken: workloads exported, manifests adjusted, DNS/ingress, storage, secrets. -->

## What I gave up

<!-- Honest list — Fedora ergonomics, SELinux defaults, glibc-only containers, etc. -->

## Would I do it again?

<!-- Verdict and what I'd change. -->
