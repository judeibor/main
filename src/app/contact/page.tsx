import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Jude Ibor for projects, collaboration, research, and opportunities.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:px-8 lg:px-12">
      <section className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          Contact
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Let&apos;s build something serious.
        </h1>

        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          For collaboration, research, partnerships, or opportunities, reach out directly using
          the details below.
        </p>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="text-xl font-semibold">Direct contact</h2>

          <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            <p>
              <span className="font-medium text-zinc-950 dark:text-zinc-100">
                Email:
              </span>{" "}
              <a
                href="mailto:admin@investmart.site"
                className="transition hover:text-zinc-950 hover:underline dark:hover:text-white"
              >
                admin@investmart.site
              </a>
            </p>

            <p>
              <span className="font-medium text-zinc-950 dark:text-zinc-100">
                Personal Email:
              </span>{" "}
              <a
                href="mailto:Judeibor234@gmail.com"
                className="transition hover:text-zinc-950 hover:underline dark:hover:text-white"
              >
                Judeibor234@gmail.com
              </a>
            </p>

            <p>
              <span className="font-medium text-zinc-950 dark:text-zinc-100">
                Phone:
              </span>{" "}
              <a
                href="tel:+2349057798042"
                className="transition hover:text-zinc-950 hover:underline dark:hover:text-white"
              >
                +234 9 057 798 042
              </a>
            </p>

            <p>
              <span className="font-medium text-zinc-950 dark:text-zinc-100">
                Location:
              </span>{" "}
              Cross River State, Nigeria
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="mailto:admin@investmart.site"
              className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Email me
            </a>

            <a
              href="tel:+2349057798042"
              className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Call me
            </a>
          </div>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="text-xl font-semibold">
            What to reach out about
          </h2>

          <ul className="mt-5 space-y-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            <li>Web3 and blockchain collaboration</li>
            <li>Software engineering opportunities</li>
            <li>Product architecture and systems design</li>
            <li>Startup and founder conversations</li>
            <li>Research, speaking, and partnership requests</li>
          </ul>

          <p className="mt-6 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            This page will later be upgraded with a proper form submission flow.
          </p>
        </article>
      </section>

      <section className="mt-12 border-t border-zinc-200 pt-12 dark:border-zinc-800">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}