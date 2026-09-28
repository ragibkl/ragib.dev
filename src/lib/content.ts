import { getCollection } from "astro:content";

export const SITE = {
  name: "Ragib Badaruddin",
  tagline: "Notes on things I've built outside work, and what they taught me.",
  github: "https://github.com/ragibkl",
  linkedin: "https://www.linkedin.com/in/ragibkl/",
  source: "https://github.com/ragibkl/ragib.dev",
};

/** Published posts, newest first. Drafts are included only in `astro dev`. */
export async function getPosts() {
  const posts = await getCollection(
    "posts",
    ({ data }) => import.meta.env.DEV || !data.draft,
  );
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getProjects() {
  const projects = await getCollection("projects");
  return projects.sort((a, b) => a.data.order - b.data.order);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
