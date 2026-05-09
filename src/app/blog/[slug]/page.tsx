import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/data/posts";
import { mdxComponents } from "@/components/mdx-components";
import { getPostStats } from "@/lib/blog-metrics";
import { PostEngagement } from "@/components/post-engagement";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://judeibor.vercel.app";

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

  const url = `${siteUrl}/blog/${post.slug}`;
  const image = post.coverImage ?? post.images?.[0];

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      url,
      siteName: "Jude Ibor",
      title: post.title,
      description: post.excerpt,
      images: image ? [image] : undefined,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const stats = await getPostStats(post.slug);
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const heroImage = post.coverImage ?? post.images?.[0];
  const galleryImages = (post.images ?? []).filter((image) => image !== heroImage);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    mainEntityOfPage: postUrl,
    author: {
      "@type": "Person",
      name: "Jude Ibor",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Jude Ibor",
      url: siteUrl,
    },
    keywords: post.tags,
    image: heroImage ? [heroImage] : undefined,
  };

  return (
    <>
      <Script
        id={`article-schema-${post.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <main className="mx-auto max-w-4xl px-6 py-16 sm:px-8 lg:px-12">
        <Link
          href="/blog"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to blog
        </Link>

        <article className="mt-8">
          {heroImage ? (
            <div className="mb-8 overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <img
                src={heroImage}
                alt={post.coverImageAlt ?? post.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          ) : null}

          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            {post.category} · {post.readingTime}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {post.title}
          </h1>

          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            {post.excerpt}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>

          {post.images && post.images.length > 1 ? (
            <section className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  Images
                </h2>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {post.images.length} attached
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {(post.images ?? [])
                  .filter((image) => image !== heroImage)
                  .map((image, index) => (
                    <figure
                      key={image}
                      className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
                    >
                      <img
                        src={image}
                        alt={`${post.title} image ${index + 1}`}
                        className="aspect-[4/3] w-full object-cover"
                        loading="lazy"
                      />
                    </figure>
                  ))}
              </div>
            </section>
          ) : null}

          <div className="mt-10 border-t border-zinc-200 pt-10 dark:border-zinc-800">
            <div className="space-y-6">
              <MDXRemote source={post.content} components={mdxComponents} />
            </div>
          </div>

          <PostEngagement
            slug={post.slug}
            initialViews={stats.views}
            initialLikes={stats.likes}
            initialComments={stats.comments}
          />
        </article>
      </main>
    </>
  );
}