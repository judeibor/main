import { NextResponse } from "next/server";
import { ensurePostStatsFile, getPostStats } from "@/lib/blog-metrics";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_req: Request, context: Context) {
  const { slug } = await context.params;

  await ensurePostStatsFile(slug);
  const stats = await getPostStats(slug);

  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}