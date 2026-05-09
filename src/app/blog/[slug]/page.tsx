import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/data/posts";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:px-12">
      <Link href="/blog" className="text-sm font-medium text-zinc-600 hover:text-zinc-950">
        ← Back to blog
      </Link>

      <article className="mt-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          {post.category} · {post.readingTime}
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          {post.title}
        </h1>

        <p className="mt-6 text-lg leading-8 text-zinc-600">{post.excerpt}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-10 space-y-6 border-t border-zinc-200 pt-10 text-base leading-8 text-zinc-700">
          {post.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}