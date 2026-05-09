import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/data/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing about Web3, systems thinking, software engineering, and product building.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:px-8 lg:px-12">
      <section className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Blog
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Notes on building, systems, decentralization, and product thinking.
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-600">
          This is where I publish ideas, lessons, and technical thinking behind the work.
        </p>
      </section>

      <section className="mt-12 space-y-6">
        {posts.map((post) => (
          <article key={post.slug} className="rounded-2xl border border-zinc-200 p-6">
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
              <span>{post.category}</span>
              <span>·</span>
              <span>{post.publishedAt}</span>
              <span>·</span>
              <span>{post.readingTime}</span>
            </div>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              <Link href={`/blog/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>

            <p className="mt-4 text-sm leading-7 text-zinc-600">{post.excerpt}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex text-sm font-medium">
              Read article →
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}