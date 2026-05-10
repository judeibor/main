import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogAdminForm } from "../blog-admin-form";
import { updatePost, deletePost } from "../actions";

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    message?: string;
  }>;
};

function getNoticeText(message?: string) {
  switch (message) {
    case "created":
      return "Post created successfully.";
    case "updated":
      return "Post updated successfully.";
    default:
      return null;
  }
}

export default async function EditPostPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { message } = await searchParams;
  const noticeText = getNoticeText(message);

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      images: {
        select: {
          id: true,
          url: true,
          fileName: true,
          alt: true,
        },
        orderBy: { createdAt: "asc" },
      },
      stats: {
        include: {
          comments: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Admin
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Edit post
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            Update the database record, replace images, or remove the post entirely.
          </p>
        </div>

        <Link
          href="/blog/admin"
          className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Back to admin
        </Link>
      </section>

      {noticeText ? (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
          {noticeText}
        </div>
      ) : null}

      <BlogAdminForm
        action={updatePost}
        mode="edit"
        initialPost={{
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          category: post.category,
          tags: post.tags,
          content: post.content,
          coverImageAlt: post.coverImageAlt,
          published: post.published,
          featured: post.featured,
          images: post.images.map((image) => image.url),
        }}
      />

      <section className="mt-8 rounded-3xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-900/40 dark:bg-zinc-900/40">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-300">
          Danger zone
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Delete this post, its images, and any related stats or comments.
        </p>

        <form action={deletePost} className="mt-4">
          <input type="hidden" name="slug" value={post.slug} />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            Delete post
          </button>
        </form>
      </section>
    </main>
  );
}