import { prisma } from "@/lib/prisma";

export type BlogComment = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

export type BlogStats = {
  views: number;
  likes: number;
  comments: BlogComment[];
};

function defaultStats(): BlogStats {
  return {
    views: 0,
    likes: 0,
    comments: [],
  };
}

async function getPostIdOrThrow(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!post) {
    throw new Error(`Post not found: ${slug}`);
  }

  return post.id;
}

function toBlogStats(record: {
  views: number;
  likes: number;
  comments: {
    id: string;
    name: string;
    message: string;
    createdAt: Date;
  }[];
}): BlogStats {
  return {
    views: Number(record.views ?? 0),
    likes: Number(record.likes ?? 0),
    comments: record.comments.map((comment) => ({
      id: comment.id,
      name: comment.name,
      message: comment.message,
      createdAt: comment.createdAt.toISOString(),
    })),
  };
}

async function ensureStatsRecord(slug: string) {
  const postId = await getPostIdOrThrow(slug);

  return prisma.blogPostStats.upsert({
    where: { postId },
    create: { postId },
    update: {},
    include: {
      comments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function ensurePostStatsFile(slug: string) {
  await ensureStatsRecord(slug);
}

export async function getPostStats(slug: string): Promise<BlogStats> {
  const postId = await getPostIdOrThrow(slug);

  const stats = await prisma.blogPostStats.findUnique({
    where: { postId },
    include: {
      comments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!stats) {
    return defaultStats();
  }

  return toBlogStats(stats);
}

export async function incrementView(slug: string) {
  const postId = await getPostIdOrThrow(slug);

  const stats = await prisma.blogPostStats.upsert({
    where: { postId },
    create: {
      postId,
      views: 1,
    },
    update: {
      views: {
        increment: 1,
      },
    },
    include: {
      comments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return toBlogStats(stats);
}

export async function incrementLike(slug: string) {
  const postId = await getPostIdOrThrow(slug);

  const stats = await prisma.blogPostStats.upsert({
    where: { postId },
    create: {
      postId,
      likes: 1,
    },
    update: {
      likes: {
        increment: 1,
      },
    },
    include: {
      comments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return toBlogStats(stats);
}

export async function addComment(
  slug: string,
  input: { name: string; message: string }
) {
  const name = input.name.trim().slice(0, 80);
  const message = input.message.trim().slice(0, 1000);

  if (!name || !message) {
    throw new Error("Name and message are required.");
  }

  const postId = await getPostIdOrThrow(slug);

  const stats = await prisma.blogPostStats.upsert({
    where: { postId },
    create: { postId },
    update: {},
    select: {
      id: true,
    },
  });

  await prisma.blogPostComment.create({
    data: {
      statsId: stats.id,
      name,
      message,
    },
  });

  return getPostStats(slug);
}