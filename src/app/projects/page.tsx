import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected projects, product ideas, and systems built by Jude Ibor.",
};

export default function ProjectsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
      <section className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          Projects
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Work that reflects systems thinking, product vision, and execution.
        </h1>

        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          A curated set of projects and initiatives that show what I build, how I think, and
          the kind of problems I want to solve.
        </p>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.slug}
            className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/40"
          >
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {project.featured ? "Featured" : "Project"}
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {project.title}
            </h2>

            <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              {project.description}
            </p>

            <p className="mt-4 text-sm font-medium text-zinc-950 dark:text-zinc-100">
              {project.impact}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                >
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-12 border-t border-zinc-200 pt-12 dark:border-zinc-800">
        <Link
          href="/contact"
          className="inline-flex rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Talk about a project
        </Link>
      </section>
    </main>
  );
}