"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  description: string;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home", description: "Intro and featured work" },
  { href: "/about", label: "About", description: "Background and story" },
  { href: "/projects", label: "Projects", description: "Selected builds" },
  { href: "/blog", label: "Blog", description: "Thoughts and updates" },
  { href: "/contact", label: "Contact", description: "Let’s work together" },
];

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M4 7H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4 12H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4 17H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M6 6L18 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M7 17L17 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 7H17V15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="sticky top-0 z-50">
      <header
        className={[
          "relative transition-all duration-300",
          scrolled
            ? "border-b border-zinc-200/80 bg-white/80 shadow-lg backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/80 dark:shadow-black/20"
            : "border-b border-transparent bg-white/65 backdrop-blur-xl dark:bg-zinc-950/55",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex h-[73px] items-center justify-between">
            <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-zinc-300/60 to-transparent dark:via-white/15" />

            <Link
              href="/"
              className="group flex items-center gap-3 transition-transform duration-300 hover:scale-[1.01]"
            >
              <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-zinc-300 bg-zinc-100 text-sm font-semibold tracking-[0.22em] text-zinc-950 shadow-lg dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                <span className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent dark:from-white/15 dark:via-white/5" />
                <span className="relative">JI</span>
              </span>

              <span className="hidden flex-col leading-tight sm:flex">
                <span className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">
                  Jude Ibor
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Engineer · Builder · Designer
                </span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 rounded-full border border-zinc-200 bg-white/80 p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:flex">
              {navItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-zinc-950 text-white shadow-md dark:bg-white dark:text-zinc-950"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="hidden rounded-full border border-zinc-300 bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-[1px] hover:bg-zinc-800 dark:border-white/10 dark:bg-gradient-to-b dark:from-white dark:to-zinc-200 dark:text-zinc-950 md:inline-flex"
              >
                Let&apos;s talk
              </Link>

              <button
                ref={buttonRef}
                type="button"
                aria-label="Toggle menu"
                aria-expanded={open}
                aria-controls="mobile-menu"
                onClick={() => setOpen((prev) => !prev)}
                className="relative z-[60] inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white/80 p-0 text-zinc-950 shadow-sm transition duration-200 hover:scale-[1.02] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 md:hidden"
              >
                <span className="sr-only">Toggle navigation menu</span>
                {open ? (
                  <CloseIcon className="h-5 w-5" />
                ) : (
                  <MenuIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={[
          "fixed inset-0 z-40 bg-black/55 backdrop-blur-md transition-opacity duration-300 md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      {/* Full-screen mobile drawer */}
      <div
        id="mobile-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={[
          "fixed inset-0 z-50 md:hidden",
          "transition-all duration-300 ease-out",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <div
          className={[
            "flex h-full w-full flex-col bg-white/95 text-zinc-950 backdrop-blur-2xl dark:bg-zinc-950/95 dark:text-white",
            "transition-transform duration-300 ease-out",
            open ? "translate-y-0" : "translate-y-3",
          ].join(" ")}
        >
          <div className="border-b border-zinc-200/80 dark:border-white/10">
            <div className="mx-auto flex h-[73px] max-w-7xl items-center justify-between px-4 sm:px-6">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3"
              >
                <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-zinc-300 bg-zinc-100 text-xs font-semibold tracking-[0.22em] text-zinc-950 dark:border-white/10 dark:bg-white/5 dark:text-white">
                  JI
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">Jude Ibor</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Engineer · Builder · Designer
                  </span>
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                aria-label="Close menu"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10 lg:px-8 lg:py-12">
              <div className="space-y-6">
                

                <div className="grid gap-3">
                  {navItems.map((item, index) => {
                    const active = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={[
                          "group flex items-center justify-between rounded-3xl border p-4 transition-all duration-200",
                          active
                            ? "border-zinc-300 bg-zinc-100 shadow-sm dark:border-white/10 dark:bg-white/10"
                            : "border-zinc-200 bg-white hover:-translate-y-[1px] hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
                        ].join(" ")}
                        style={{
                          transitionDelay: open ? `${index * 40}ms` : "0ms",
                        }}
                      >
                        <span className="min-w-0">
                          <span className="block text-base font-semibold">{item.label}</span>
                          <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">
                            {item.description}
                          </span>
                        </span>

                        <ArrowUpRightIcon
                          className={[
                            "ml-4 h-5 w-5 shrink-0 transition-transform duration-200",
                            active
                              ? "text-zinc-950 dark:text-white"
                              : "text-zinc-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-zinc-700 dark:text-zinc-500 dark:group-hover:text-zinc-300",
                          ].join(" ")}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                    Quick actions
                  </p>

                  <div className="mt-4 grid gap-3">
                    <Link
                      href="/contact"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl bg-zinc-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                    >
                      <span>Let&apos;s talk</span>
                      <ArrowUpRightIcon className="h-4 w-4" />
                    </Link>

                    <Link
                      href="/projects"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5"
                    >
                      <span>View projects</span>
                      <ArrowUpRightIcon className="h-4 w-4" />
                    </Link>

                    <Link
                      href="/blog"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5"
                    >
                      <span>Read blog</span>
                      <ArrowUpRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-5 shadow-sm dark:border-white/10 dark:from-white/5 dark:to-white/[0.03]">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                    Availability
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                    Open to freelance work, collaboration, and product builds.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}