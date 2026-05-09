import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://judeibor.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Blog",
    template: "%s | Jude Ibor Blog",
  },
  description:
    "Writing about Web3, systems thinking, software engineering, product building, and decentralized infrastructure.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/blog`,
    siteName: "Jude Ibor",
    title: "Blog | Jude Ibor",
    description:
      "Writing about Web3, systems thinking, software engineering, product building, and decentralized infrastructure.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Jude Ibor",
    description:
      "Writing about Web3, systems thinking, software engineering, product building, and decentralized infrastructure.",
  },
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <section className="min-h-screen">{children}</section>;
}