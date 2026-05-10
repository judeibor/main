import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

function getOrCreateVisitorId(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const existing = cookieStore.get("blog_visitor_id")?.value;
  if (existing) return { visitorId: existing, created: false };

  const visitorId =
    globalThis.crypto?.randomUUID?.() ??
    `visitor_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  return { visitorId, created: true };
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const { visitorId, created: visitorCookieNeedsSet } =
    getOrCreateVisitorId(cookieStore);

  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      id: true,
      stats: {
        select: {
          likes: true,
        },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const existingLike = await prisma.blogPostLike.findUnique({
    where: {
      postId_visitorId: {
        postId: post.id,
        visitorId,
      },
    },
    select: {
      id: true,
    },
  });

  let liked = false;
  let likes = post.stats?.likes ?? 0;

  if (existingLike) {
    await prisma.$transaction(async (tx) => {
      await tx.blogPostLike.delete({
        where: { id: existingLike.id },
      });

      const stats = await tx.blogPostStats.update({
        where: { postId: post.id },
        data: {
          likes: {
            decrement: 1,
          },
        },
        select: {
          likes: true,
        },
      });

      likes = Math.max(stats.likes, 0);
    });

    liked = false;
  } else {
    await prisma.$transaction(async (tx) => {
      const stats = post.stats
        ? await tx.blogPostStats.update({
            where: { postId: post.id },
            data: {
              likes: {
                increment: 1,
              },
            },
            select: {
              likes: true,
            },
          })
        : await tx.blogPostStats.create({
            data: {
              postId: post.id,
              likes: 1,
              views: 0,
            },
            select: {
              likes: true,
            },
          });

      await tx.blogPostLike.create({
        data: {
          postId: post.id,
          visitorId,
        },
      });

      likes = stats.likes;
    });

    liked = true;
  }

  const response = NextResponse.json({
    liked,
    likes,
  });

  if (visitorCookieNeedsSet) {
    response.cookies.set("blog_visitor_id", visitorId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}