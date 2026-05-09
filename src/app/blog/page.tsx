import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { getAllPosts } from "@/data/posts";
import { getPostStats } from "@/lib/blog-metrics";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://judeibor.vercel.app";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Writing about Web3, systems thinking, software engineering, product building, and decentralized infrastructure.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/blog`,
    siteName: "Jude Ibor",
    title: "Blog",
    description:
      "Writing about Web3, systems thinking, software engineering, product building, and decentralized infrastructure.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog",
    description:
      "Writing about Web3, systems thinking, software engineering, product building, and decentralized infrastructure.",
  },
};

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Jude Ibor Blog",
  url: `${siteUrl}/blog`,
  description:
    "Writing about Web3, systems thinking, software engineering, product building, and decentralized infrastructure.",
  author: {
    "@type": "Person",
    name: "Jude Ibor",
    url: siteUrl,
  },
};

type BlogPageProps = {
  searchParams?: Promise<{
    show?: string;
  }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = (await searchParams) ?? {};
  const showAll = params.show === "all";

  const posts = getAllPosts();
  const visiblePosts = showAll ? posts : posts.slice(0, 3);

  const postsWithStats = await Promise.all(
    visiblePosts.map(async (post) => {
      const stats = await getPostStats(post.slug);
      return {
        ...post,
        stats,
      };
    })
  );

  return (
    <>
      <Script
        id="blog-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      <main className="mx-auto max-w-5xl px-6 py-16 sm:px-8 lg:px-12">
        <section className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Blog
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Notes on building, systems, decentralization, and product thinking.
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            This is where I publish ideas, lessons, and technical thinking behind the work.
          </p>
        </section>

        <section className="mt-12 space-y-6">
          {postsWithStats.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              No posts yet.
            </div>
          ) : (
            postsWithStats.map((post) => {
              const coverImage = post.coverImage ?? post.images?.[0];
              const hasImage = Boolean(coverImage);

              return (
                <article
                  key={post.slug}
                  className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/40 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700 dark:hover:shadow-black/20"
                >
                  {hasImage ? (
                    <div className="grid gap-0 lg:grid-cols-[360px,1fr]">
                      <div className="relative overflow-hidden border-b border-zinc-200 bg-zinc-100 lg:border-b-0 lg:border-r lg:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950">
                        <img
                          src={coverImage}
                          alt={post.coverImageAlt ?? post.title}
                          className="aspect-[16/11] h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] lg:aspect-auto lg:min-h-full"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex flex-col p-6 sm:p-7">
                        <PostCardContent post={post} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col p-6 sm:p-7">
                      <PostCardContent post={post} />
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>

        {posts.length > 3 && !showAll ? (
          <div className="mt-10 flex justify-center">
            <Link
              href="/blog?show=all"
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              See more
            </Link>
          </div>
        ) : null}
      </main>
    </>
  );
}

function PostCardContent({
  post,
}: {
  post: Awaited<ReturnType<typeof getAllPosts>>[number] & {
    stats: Awaited<ReturnType<typeof getPostStats>>;
  };
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
        <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-200">
          {post.category}
        </span>
        <span>{post.readingTime}</span>
      </div>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
        <Link href={`/blog/${post.slug}`} className="hover:underline">
          {post.title}
        </Link>
      </h2>

      <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
        {post.excerpt}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-1 items-end">
        <div className="flex w-full flex-col gap-4 border-t border-zinc-200 pt-5 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <span>{post.stats.views} views</span>
            <span>{post.stats.likes} likes</span>
            <span>{post.stats.comments.length} comments</span>
          </div>

          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex font-medium text-zinc-900 hover:underline dark:text-zinc-50"
          >
            Read article →
          </Link>
        </div>
      </div>
    </>
  );
}