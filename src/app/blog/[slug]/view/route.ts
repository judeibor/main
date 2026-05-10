import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const cookieName = `blog_viewed_${slug}`;
  const alreadyViewed = cookieStore.get(cookieName)?.value === "1";

  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      id: true,
      stats: {
        select: {
          views: true,
        },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (alreadyViewed) {
    return NextResponse.json({
      recorded: false,
      views: post.stats?.views ?? 0,
    });
  }

  const stats = post.stats
    ? await prisma.blogPostStats.update({
        where: { postId: post.id },
        data: {
          views: {
            increment: 1,
          },
        },
        select: {
          views: true,
        },
      })
    : await prisma.blogPostStats.create({
        data: {
          postId: post.id,
          likes: 0,
          views: 1,
        },
        select: {
          views: true,
        },
      });

  const response = NextResponse.json({
    recorded: true,
    views: stats.views,
  });

  response.cookies.set(cookieName, "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}