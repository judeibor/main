import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about Jude Ibor, a Nigerian software developer, Web3 innovator, blockchain researcher, and founder of Vector Network.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:px-8 lg:px-12">
      <section className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          About
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Jude Ibor — builder, founder, and systems thinker.
        </h1>

        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          I am a Nigerian software developer, Web3 innovator, blockchain researcher, and founder
          focused on building next-generation decentralized systems.
        </p>
      </section>

      <section className="mt-12 grid gap-10 border-t border-zinc-200 py-12 dark:border-zinc-800 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold tracking-tight">My story</h2>

          <div className="mt-6 space-y-5 text-base leading-8 text-zinc-600 dark:text-zinc-300">
            <p>
              I am from Cross River State, Nigeria, and I am currently studying Computer Science
              (B.Sc.) at the University of Cross River State (UNICROSS), where I am in my 300 level.
            </p>
            <p>
              My journey in technology is driven by a deep curiosity about how systems work and how
              technology can be used to create scalable solutions that solve real-world problems.
            </p>
            <p>
              I am the Founder and CEO of Vector Network (vNetwork), a decentralized vector-based
              economic system designed to redefine how value, trust, lending, staking, and digital
              economies function.
            </p>
            <p>
              The vision behind Vector Network is to move beyond traditional static finance into a
              dynamic system where value behaves like vectors — flowing, interacting, evolving, and
              carrying programmable economic behavior across decentralized environments.
            </p>
          </div>
        </div>

        <aside className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="text-lg font-semibold">Personal information</h2>

          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Full Name</dt>
              <dd className="mt-1 font-medium text-zinc-950 dark:text-zinc-100">
                Jude Ibor
              </dd>
            </div>

            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Role</dt>
              <dd className="mt-1 font-medium text-zinc-950 dark:text-zinc-100">
                Founder & CEO of Vector Network (vNetwork)
              </dd>
            </div>

            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Location</dt>
              <dd className="mt-1 font-medium text-zinc-950 dark:text-zinc-100">
                Cross River State, Nigeria
              </dd>
            </div>

            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">University</dt>
              <dd className="mt-1 font-medium text-zinc-950 dark:text-zinc-100">
                University of Cross River State (UNICROSS)
              </dd>
            </div>

            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Course</dt>
              <dd className="mt-1 font-medium text-zinc-950 dark:text-zinc-100">
                Computer Science (B.Sc.)
              </dd>
            </div>

            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Level</dt>
              <dd className="mt-1 font-medium text-zinc-950 dark:text-zinc-100">
                300 Level
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="grid gap-8 border-t border-zinc-200 py-12 dark:border-zinc-800 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">What I build</h2>
          <p className="mt-4 text-base leading-8 text-zinc-600 dark:text-zinc-300">
            As a full-stack developer, I work across frontend, backend, blockchain, APIs, and
            system architecture. My technical stack includes JavaScript, React, React Native,
            HTML5, CSS3, Node.js, Python, Firebase, REST APIs, blockchain technologies, databases,
            and AI-related tools.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight">What I care about</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            <li>Decentralized Finance (DeFi)</li>
            <li>Artificial Intelligence</li>
            <li>Blockchain architecture</li>
            <li>Smart contracts</li>
            <li>Digital ecosystems</li>
            <li>Startup innovation</li>
            <li>Product engineering</li>
            <li>Financial infrastructure</li>
          </ul>
        </div>
      </section>

      <section className="border-t border-zinc-200 py-12 dark:border-zinc-800">
        <h2 className="text-2xl font-semibold tracking-tight">My mindset</h2>

        <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-600 dark:text-zinc-300">
          I think in systems and structures. I care about originality, long-term thinking, and
          execution. I believe vision without execution is incomplete, and I build with the goal of
          creating useful, scalable, and technically sound systems.
        </p>

        <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-600 dark:text-zinc-300">
          I am expanding my skills in software engineering, decentralized systems, AI integration,
          and product architecture while actively developing projects that reflect my vision for
          the future of technology.
        </p>

        <div className="mt-8">
          <Link
            href="/contact"
            className="inline-flex rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Contact me
          </Link>
        </div>
      </section>
    </main>
  );
}