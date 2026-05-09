//src\app\blog\admin\page.tsx

import type { Metadata } from "next";
import { createPost } from "./actions";
import { BlogAdminForm } from "./blog-admin-form";

export const metadata: Metadata = {
  title: "Blog Admin",
  description: "Private blog publishing area.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BlogAdminPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
          Private
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          New blog post
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
          Write once, save directly as MDX in{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">
            content/blog
          </code>
          .
        </p>
      </section>

      <BlogAdminForm action={createPost} />
    </main>
  );
}