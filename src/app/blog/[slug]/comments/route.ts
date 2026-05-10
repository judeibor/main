import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const name = readString(body.name) || "Anonymous";
  const message = readString(body.message) || readString(body.content);

  if (!message) {
    return NextResponse.json(
      { error: "Comment cannot be empty." },
      { status: 400 }
    );
  }

  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      id: true,
      stats: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const stats =
    post.stats ??
    (await prisma.blogPostStats.create({
      data: {
        postId: post.id,
        likes: 0,
        views: 0,
      },
      select: {
        id: true,
      },
    }));

  const comment = await prisma.blogPostComment.create({
    data: {
      statsId: stats.id,
      name,
      message,
    },
    select: {
      id: true,
      name: true,
      message: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    comment: {
      id: comment.id,
      name: comment.name,
      message: comment.message,
      createdAt: comment.createdAt.toISOString(),
    },
  });
}