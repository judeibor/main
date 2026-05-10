import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { BlogEngagement } from "./BlogEngagement";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const visitorId = cookieStore.get("blog_visitor_id")?.value ?? null;

  const post = await prisma.post.findFirst({
    where: {
      slug,
      published: true,
    },
    include: {
      images: {
        orderBy: { createdAt: "asc" },
      },
      stats: {
        include: {
          comments: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const coverImage = post.coverImage ?? post.images[0]?.url;
  const galleryImages = coverImage ? post.images.slice(1) : post.images;

  const likedByViewer = visitorId
    ? await prisma.blogPostLike.findUnique({
        where: {
          postId_visitorId: {
            postId: post.id,
            visitorId,
          },
        },
        select: {
          id: true,
        },
      }).then(Boolean)
    : false;

  const initialComments = (post.stats?.comments ?? []).map((comment) => ({
    id: comment.id,
    name: comment.name,
    message: comment.message,
    createdAt: comment.createdAt.toISOString(),
  }));

  return (
    <main className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
      <section className="max-w-4xl">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to blog
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          <span>{post.category}</span>
          {post.featured ? <span>Featured</span> : null}
          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
        </div>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          {post.title}
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          {post.excerpt}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          {coverImage ? (
            <img
              src={coverImage}
              alt={post.coverImageAlt ?? post.title}
              className="aspect-[16/9] w-full object-cover"
            />
          ) : null}

          <div className="p-6 sm:p-8">
            {galleryImages.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {galleryImages.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800"
                  >
                    <img
                      src={image.url}
                      alt={image.alt ?? post.title}
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-zinc-700 dark:text-zinc-300">
              {post.content}
            </div>
          </div>
        </article>

        
      </section>

      <BlogEngagement
        slug={post.slug}
        initialViews={post.stats?.views ?? 0}
        initialLikes={post.stats?.likes ?? 0}
        initialLiked={likedByViewer}
        initialComments={initialComments}
      />
    </main>
  );
}