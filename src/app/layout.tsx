import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://judeibor.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jude Ibor | Developer, Founder, Web3 Builder",
    template: "%s | Jude Ibor",
  },
  description:
    "Jude Ibor is a Nigerian software developer, Web3 innovator, blockchain researcher, and founder building next-generation decentralized systems.",
  applicationName: "Jude Ibor Portfolio",
  authors: [{ name: "Jude Ibor" }],
  creator: "Jude Ibor",
  publisher: "Jude Ibor",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Jude Ibor",
    "developer",
    "founder",
    "Web3 builder",
    "blockchain researcher",
    "software developer Nigeria",
    "Node.js developer Nigeria",
    "React developer",
    "Next.js developer",
    "decentralized systems",
    "Vector Network",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Jude Ibor",
    title: "Jude Ibor | Developer, Founder, Web3 Builder",
    description:
      "Nigerian software developer, Web3 innovator, blockchain researcher, and founder of Vector Network.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jude Ibor | Developer, Founder, Web3 Builder",
    description:
      "Nigerian software developer, Web3 innovator, blockchain researcher, and founder of Vector Network.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-zinc-950 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <div className="min-h-screen">
          <SiteHeader />
          {children}
          <footer className="border-t border-zinc-200 dark:border-zinc-800">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-zinc-600 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12 dark:text-zinc-400">
              <p>©️ {new Date().getFullYear()} Jude Ibor. All rights reserved.</p>
              <p>Founder & CEO of Vector Network (vNetwork)</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}