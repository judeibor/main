import { prisma } from "@/lib/prisma";
import { estimateReadingTime } from "@/lib/blog-utils";

type PostWithImages = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: Date;
  updatedAt: Date | null;
  category: string;
  tags: string[] | null;
  content: string;
  coverImage: string | null;
  coverImageAlt: string | null;
  published: boolean;
  featured: boolean;
  wordCount: number | null;
  images: { url: string }[];
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags: string[];
  content: string;
  readingTime: string;
  coverImage?: string;
  coverImageAlt?: string;
  images?: string[];
  published?: boolean;
  featured?: boolean;
  wordCount?: number;
};

function serializePost(post: PostWithImages): Post {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt.toISOString(),
    updatedAt: post.updatedAt?.toISOString(),
    category: post.category,
    tags: post.tags ?? [],
    content: post.content,
    readingTime: estimateReadingTime(post.content),
    coverImage: post.coverImage ?? undefined,
    coverImageAlt: post.coverImageAlt ?? undefined,
    images: post.images.map((image) => image.url),
    published: post.published,
    featured: post.featured,
    wordCount: post.wordCount ?? undefined,
  };
}

export async function getAllPosts(options: { includeDrafts?: boolean } = {}) {
  const posts = await prisma.post.findMany({
    where: options.includeDrafts ? undefined : { published: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: {
      images: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return posts.map(serializePost);
}

export async function getPostBySlug(
  slug: string,
  options: { includeDrafts?: boolean } = {}
) {
  const post = await prisma.post.findFirst({
    where: options.includeDrafts ? { slug } : { slug, published: true },
    include: {
      images: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return post ? serializePost(post as PostWithImages) : null;
}