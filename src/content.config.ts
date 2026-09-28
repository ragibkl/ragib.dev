import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    // Drafts show up in `npm run dev` only.
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

const projects = defineCollection({
  loader: file("src/data/projects.yaml"),
  schema: z.object({
    order: z.number().int(),
    name: z.string(),
    summary: z.string(),
    description: z.string(),
    since: z.number().int(),
    featured: z.boolean().default(false),
    tech: z.array(z.string()),
    links: z.array(z.object({ label: z.string(), href: z.url() })),
  }),
});

export const collections = { posts, projects };
