import { BlogAdminForm } from "../blog-admin-form";
import { createPost } from "../actions";

export const dynamic = "force-dynamic";

export default function NewPostPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
      <section className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          Admin
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Create a new post
        </h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          Save the post directly to PostgreSQL, including images and metadata.
        </p>
      </section>

      <BlogAdminForm action={createPost} mode="create" />
    </main>
  );
}