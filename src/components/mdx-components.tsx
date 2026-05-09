import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";

type AnchorProps = ComponentPropsWithoutRef<"a">;

export const mdxComponents = {
  a: ({ href, children, ...props }: AnchorProps) => {
    if (!href) {
      return (
        <span {...props} className={props.className}>
          {children}
        </span>
      );
    }

    const isExternal = href.startsWith("http://") || href.startsWith("https://");

    if (isExternal) {
      return (
        <a
          href={href}
          {...props}
          className="font-medium text-zinc-950 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300"
          target="_blank"
          rel="noreferrer noopener"
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        href={href}
        {...props}
        className="font-medium text-zinc-950 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300"
      >
        {children}
      </Link>
    );
  },
};