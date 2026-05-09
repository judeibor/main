import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { getAllPosts } from "@/data/posts";
import { projects } from "@/data/projects";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://judeibor.vercel.app";

export const metadata: Metadata = {
  title: {
    absolute: "Jude Ibor | Developer, Founder, Web3 Builder",
  },
  description:
    "Jude Ibor is a Nigerian software developer, Web3 innovator, blockchain researcher, and founder of Vector Network (vNetwork).",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Jude Ibor",
    title: "Jude Ibor | Developer, Founder, Web3 Builder",
    description:
      "Nigerian software developer, Web3 innovator, blockchain researcher, and founder of Vector Network (vNetwork).",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jude Ibor | Developer, Founder, Web3 Builder",
    description:
      "Nigerian software developer, Web3 innovator, blockchain researcher, and founder of Vector Network (vNetwork).",
  },
};

const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Jude Ibor",
      description:
        "Portfolio, blog, and project hub for Jude Ibor, a Nigerian software developer and founder.",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Jude Ibor",
      url: siteUrl,
      jobTitle: "Software Developer",
      worksFor: {
        "@id": `${siteUrl}/#organization`,
      },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Vector Network",
      alternateName: "vNetwork",
      url: siteUrl,
      description:
        "A decentralized vector-based economic system building next-generation digital infrastructure.",
    },
  ],
};

export default function HomePage() {
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 3);
  const latestPost = getAllPosts()[0];

  return (
    <>
      <Script
        id="home-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />

      <main className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
        <section className="max-w-4xl py-8 sm:py-16">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
            Nigerian Software Developer • Web3 Innovator • Founder
          </p>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
            Jude Ibor is a Nigerian software developer, Web3 builder, and founder building
            decentralized systems, product experiences, and long-term digital infrastructure.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            Founder & CEO of Vector Network (vNetwork), Computer Science student at UNICROSS,
            and a full-stack builder focused on scalable software, blockchain, and the future of
            digital economies.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/projects"
              className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              View Projects
            </Link>
            <Link
              href="/blog"
              className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Read Blog
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Contact Me
            </Link>
          </div>
        </section>

        <section className="grid gap-6 border-t border-zinc-200 py-12 dark:border-zinc-800 md:grid-cols-3">
          <div>
            <h2 className="text-lg font-semibold">Founder mindset</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              I build with long-term vision, originality, and execution. My work is centered on
              useful systems that solve real problems.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Technical focus</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              Frontend, backend, blockchain, APIs, databases, AI tools, and product architecture.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Current mission</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              Expanding Vector Network and building a public developer brand around serious systems
              work.
            </p>
          </div>
        </section>

        <section className="border-t border-zinc-200 py-12 dark:border-zinc-800">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Featured Projects
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Selected work</h2>
            </div>
            <Link
              href="/projects"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              See all
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featuredProjects.map((project) => (
              <article
                key={project.slug}
                className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
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
          </div>
        </section>

        <section className="grid gap-8 border-t border-zinc-200 py-12 dark:border-zinc-800 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              Latest Writing
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Recent post</h2>

            {latestPost ? (
              <article className="mt-6 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {latestPost.category} · {latestPost.readingTime}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{latestPost.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {latestPost.excerpt}
                </p>
                <Link
                  href={`/blog/${latestPost.slug}`}
                  className="mt-5 inline-flex text-sm font-medium text-zinc-950 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
                >
                  Read post →
                </Link>
              </article>
            ) : (
              <div className="mt-6 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
                <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  More writing is coming soon.
                </p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              About this site
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Built for discovery</h2>
            <p className="mt-6 text-base leading-8 text-zinc-600 dark:text-zinc-300">
              This site is designed to present a clear professional identity, publish articles,
              showcase projects, and make it easy for people to contact you.
            </p>
            <p className="mt-4 text-base leading-8 text-zinc-600 dark:text-zinc-300">
              It is the base for your full personal brand platform.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}