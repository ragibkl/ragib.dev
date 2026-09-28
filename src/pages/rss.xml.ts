import rss from "@astrojs/rss";
import type { APIContext } from "astro";

import { SITE, getPosts } from "../lib/content";

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: SITE.name,
    description: SITE.tagline,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/writing/${post.id}/`,
      categories: post.data.tags,
    })),
  });
}
