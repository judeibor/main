import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type ImgProps = ComponentPropsWithoutRef<"img">;

export const mdxComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      {...props}
      className="mt-10 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100"
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      {...props}
      className="mt-8 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100"
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p
      {...props}
      className="text-base leading-8 text-zinc-700 dark:text-zinc-300"
    />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      {...props}
      className="my-6 list-disc space-y-3 pl-6 text-base leading-8 text-zinc-700 dark:text-zinc-300"
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      {...props}
      className="my-6 list-decimal space-y-3 pl-6 text-base leading-8 text-zinc-700 dark:text-zinc-300"
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      {...props}
      className="my-8 border-l-4 border-zinc-300 pl-5 italic text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
    />
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr {...props} className="my-10 border-zinc-200 dark:border-zinc-800" />
  ),
  a: ({
    href,
    children,
    ...props
  }: ComponentPropsWithoutRef<"a"> & { href?: string }) => {
    if (!href) {
      return (
        <span
          {...props}
          className="font-medium text-zinc-950 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
        >
          {children}
        </span>
      );
    }

    const isInternal = href.startsWith("/");

    if (isInternal) {
      return (
        <Link
          href={href}
          {...props}
          className="font-medium text-zinc-950 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
        >
          {children}
        </Link>
      );
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        {...props}
        className="font-medium text-zinc-950 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
      >
        {children}
      </a>
    );
  },
  img: ({ alt = "", ...props }: ImgProps) => (
    <figure className="my-8 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <img {...props} alt={alt} className="h-auto w-full" />
      {alt ? (
        <figcaption className="border-t border-zinc-200 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          {alt}
        </figcaption>
      ) : null}
    </figure>
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      {...props}
      className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.92em] text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      {...props}
      className="my-8 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
    />
  ),
} as const;