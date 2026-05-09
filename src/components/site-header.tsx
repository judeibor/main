"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
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

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!open) return;

      const target = e.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div className="sticky top-0 z-50">
      <header
        className={[
          "relative transition-all duration-300",
          scrolled
            ? "border-b border-zinc-200/80 bg-white/80 shadow-lg backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/80 dark:shadow-black/20"
            : "border-b border-transparent bg-white/70 backdrop-blur-xl dark:bg-zinc-950/55",
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
                className="relative z-[60] inline-flex h-11 w-11 items-center justify-center bg-transparent p-0 text-zinc-950 transition duration-200 hover:opacity-80 dark:text-white md:hidden"
              >
                <span className="sr-only">Toggle navigation menu</span>

                <span className="relative block h-5 w-6">
                  <span
                    className={[
                      "absolute left-0 top-0 h-0.5 w-6 rounded-full bg-current transition-all duration-300 ease-in-out",
                      open ? "top-2 rotate-45" : "",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "absolute left-0 top-2 h-0.5 w-6 rounded-full bg-current transition-all duration-300 ease-in-out",
                      open ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "absolute left-0 top-4 h-0.5 w-6 rounded-full bg-current transition-all duration-300 ease-in-out",
                      open ? "top-2 -rotate-45" : "",
                    ].join(" ")}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={[
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <div
        id="mobile-menu"
        ref={menuRef}
        className={[
          "absolute left-0 right-0 top-[73px] z-50 px-4 transition-all duration-300 ease-out md:hidden",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/95 p-3 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/95 dark:shadow-black/40">
            <div className="mb-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                Navigation
              </p>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                Explore the portfolio and get in touch.
              </p>
            </div>

            <div className="space-y-1">
              {navItems.map((item, index) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "group flex items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "border-zinc-300 bg-zinc-100 text-zinc-950 dark:border-white/10 dark:bg-white/10 dark:text-white"
                        : "border-transparent text-zinc-700 hover:border-zinc-200 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white",
                    ].join(" ")}
                    style={{
                      transitionDelay: open ? `${index * 40}ms` : "0ms",
                    }}
                  >
                    <span>{item.label}</span>
                    <ArrowUpRightIcon
                      className={[
                        "h-4 w-4 transition-all duration-200",
                        active
                          ? "text-zinc-950 dark:text-white"
                          : "text-zinc-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-700 dark:text-zinc-500 dark:group-hover:text-zinc-300",
                      ].join(" ")}
                    />
                  </Link>
                );
              })}
            </div>

            <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-white/10">
              <Link
                href="/contact"
                className="flex w-full items-center justify-center rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-[1px] hover:bg-zinc-800 dark:bg-gradient-to-b dark:from-white dark:to-zinc-200 dark:text-zinc-950"
              >
                Let&apos;s talk
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}