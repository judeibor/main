import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePost } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    message?: string;
    slug?: string;
  }>;
};

function getNoticeText(message?: string, slug?: string) {
  switch (message) {
    case "created":
      return "Post created successfully.";
    case "updated":
      return "Post updated successfully.";
    case "deleted":
      return slug ? `Post "${slug}" deleted successfully.` : "Post deleted successfully.";
    default:
      return null;
  }
}

export default async function BlogAdminPage({ searchParams }: Props) {
  const { message, slug } = await searchParams;
  const noticeText = getNoticeText(message, slug);

  const posts = await prisma.post.findMany({
    include: {
      images: {
        orderBy: { createdAt: "asc" },
      },
      stats: {
        include: {
          comments: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { publishedAt: "desc" }],
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Admin
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Blog content manager
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            Create posts, edit existing entries, or delete records from the database.
          </p>
        </div>

        <Link
          href="/blog/admin/new"
          className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          New post
        </Link>
      </section>

      {noticeText ? (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
          {noticeText}
        </div>
      ) : null}

      <section className="mt-10 space-y-4">
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            No posts in the database yet.
          </div>
        ) : (
          posts.map((post) => {
            const coverImage = post.coverImage ?? post.images[0]?.url;
            const commentsCount = post.stats?.comments.length ?? 0;

            return (
              <article
                key={post.id}
                className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <div className="grid gap-0 lg:grid-cols-[260px,1fr]">
                  <div className="border-b border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/40 lg:border-b-0 lg:border-r">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={post.coverImageAlt ?? post.title}
                        className="aspect-[4/3] w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-zinc-300 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-5 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                      <span className="rounded-full border border-zinc-200 px-3 py-1 text-[11px] tracking-normal text-zinc-700 dark:border-zinc-800 dark:text-zinc-200">
                        {post.published ? "Published" : "Draft"}
                      </span>
                      {post.featured ? (
                        <span className="rounded-full border border-zinc-200 px-3 py-1 text-[11px] tracking-normal text-zinc-700 dark:border-zinc-800 dark:text-zinc-200">
                          Featured
                        </span>
                      ) : null}
                      <span>{post.category}</span>
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {post.title}
                      </h2>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-col gap-4 border-t border-zinc-200 pt-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-4">
                        <span>{post.wordCount} words</span>
                        <span>{post.stats?.views ?? 0} views</span>
                        <span>{post.stats?.likes ?? 0} likes</span>
                        <span>{commentsCount} comments</span>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/blog/admin/${post.slug}`}
                          className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                          Edit
                        </Link>

                        <form action={deletePost}>
                          <input type="hidden" name="slug" value={post.slug} />
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}