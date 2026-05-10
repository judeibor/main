"use server";

import { Buffer } from "buffer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import path from "path";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ensurePostStatsFile } from "@/lib/blog-metrics";
import { countWords, parseTags, slugify } from "@/lib/blog-utils";

function isSafeSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function isFile(value: FormDataEntryValue): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

function safeImageFileName(fileName: string, index: number) {
  const ext = path.extname(fileName).toLowerCase() || ".jpg";
  const base = path
    .basename(fileName, ext)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${index + 1}-${base || `image-${index + 1}`}${ext}`;
}

function getImageRoute(slug: string, fileName: string) {
  return `/blog/${slug}/${fileName}`;
}

function rewriteImageRoute(url: string, fromSlug: string, toSlug: string) {
  return url.replaceAll(`/blog/${fromSlug}/`, `/blog/${toSlug}/`);
}

async function ensureStatsFileSafely(slug: string) {
  try {
    await ensurePostStatsFile(slug);
  } catch (error) {
    console.error(`Failed to ensure stats file for "${slug}":`, error);
  }
}

async function buildImageRecords(slug: string, files: File[]) {
  return Promise.all(
    files.map(async (file, index) => {
      const fileName = safeImageFileName(file.name, index);
      const url = getImageRoute(slug, fileName);
      const data = Buffer.from(await file.arrayBuffer());

      return {
        url,
        fileName,
        mimeType: file.type || "application/octet-stream",
        data,
      };
    })
  );
}

export async function createPost(formData: FormData) {
  const rawSlug = String(formData.get("slug") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const category = String(formData.get("category") || "General").trim();
  const tags = parseTags(String(formData.get("tags") || ""));
  const coverImageAltInput = String(formData.get("coverImageAlt") || "").trim();
  const content = String(formData.get("content") || "").trim();

  const published = formData.get("published") === "on";
  const featured = formData.get("featured") === "on";

  const slug = slugify(rawSlug || title);

  if (!slug || !isSafeSlug(slug)) {
    throw new Error("Please enter a valid slug using letters, numbers, and hyphens only.");
  }

  if (!title || !excerpt || !content) {
    throw new Error("Missing required fields");
  }

  const uploadedImages = formData
    .getAll("postImages")
    .filter(isFile)
    .filter((file) => file.size > 0);

  const now = new Date();
  const wordCount = countWords(`${title} ${excerpt} ${content}`);
  const imageRecords = uploadedImages.length > 0 ? await buildImageRecords(slug, uploadedImages) : [];
  const coverImage = imageRecords[0]?.url ?? null;
  const coverImageAlt = coverImage ? coverImageAltInput || title : null;

  try {
    await prisma.post.create({
      data: {
        slug,
        title,
        excerpt,
        content,
        category,
        tags,
        coverImage,
        coverImageAlt,
        wordCount,
        published,
        featured,
        publishedAt: now,
        images:
          imageRecords.length > 0
            ? {
                create: imageRecords.map((image, index) => ({
                  url: image.url,
                  fileName: image.fileName,
                  mimeType: image.mimeType,
                  data: image.data,
                  alt: index === 0 ? coverImageAlt : null,
                })),
              }
            : undefined,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error(`A post with slug "${slug}" already exists.`);
    }

    throw error;
  }

  await ensureStatsFileSafely(slug);

  revalidatePath("/blog");
  revalidatePath("/blog/admin");
  revalidatePath(`/blog/${slug}`);
  revalidatePath(`/blog/admin/${slug}`);

  redirect(`/blog/admin/${slug}?message=created`);
}

export async function updatePost(formData: FormData) {
  const originalSlug = String(formData.get("originalSlug") || "").trim();
  const rawSlug = String(formData.get("slug") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const category = String(formData.get("category") || "General").trim();
  const tags = parseTags(String(formData.get("tags") || ""));
  const coverImageAltInput = String(formData.get("coverImageAlt") || "").trim();
  const contentInput = String(formData.get("content") || "").trim();

  const published = formData.get("published") === "on";
  const featured = formData.get("featured") === "on";

  const slug = slugify(rawSlug || title);

  if (!originalSlug) {
    throw new Error("Missing original slug.");
  }

  if (!slug || !isSafeSlug(slug)) {
    throw new Error("Please enter a valid slug using letters, numbers, and hyphens only.");
  }

  if (!title || !excerpt || !contentInput) {
    throw new Error("Missing required fields");
  }

  const existing = await prisma.post.findUnique({
    where: { slug: originalSlug },
    include: {
      images: {
        select: {
          id: true,
          url: true,
          fileName: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!existing) {
    throw new Error(`Post "${originalSlug}" not found.`);
  }

  const slugChanged = slug !== originalSlug;
  const uploadedImages = formData
    .getAll("postImages")
    .filter(isFile)
    .filter((file) => file.size > 0);

  const wordCount = countWords(`${title} ${excerpt} ${contentInput}`);
  const nextContent = slugChanged
    ? contentInput.replaceAll(`/blog/${originalSlug}/`, `/blog/${slug}/`)
    : contentInput;

  if (uploadedImages.length > 0) {
    const imageRecords = await buildImageRecords(slug, uploadedImages);
    const coverImage = imageRecords[0]?.url ?? null;
    const coverImageAlt = coverImage ? coverImageAltInput || title : null;

    try {
      await prisma.post.update({
        where: { slug: originalSlug },
        data: {
          slug,
          title,
          excerpt,
          content: nextContent,
          category,
          tags,
          coverImage,
          coverImageAlt,
          wordCount,
          published,
          featured,
          images: {
            deleteMany: {},
            create: imageRecords.map((image, index) => ({
              url: image.url,
              fileName: image.fileName,
              mimeType: image.mimeType,
              data: image.data,
              alt: index === 0 ? coverImageAlt : null,
            })),
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error(`A post with slug "${slug}" already exists.`);
      }

      throw error;
    }
  } else {
    const primaryImageUrl =
      existing.coverImage ?? existing.images[0]?.url ?? null;

    const nextCoverImage = primaryImageUrl
      ? slugChanged
        ? rewriteImageRoute(primaryImageUrl, originalSlug, slug)
        : primaryImageUrl
      : null;

    const nextCoverImageAlt = nextCoverImage
      ? coverImageAltInput || existing.coverImageAlt || title
      : null;

    if (slugChanged && existing.images.length > 0) {
      await prisma.$transaction([
        prisma.post.update({
          where: { slug: originalSlug },
          data: {
            slug,
            title,
            excerpt,
            content: nextContent,
            category,
            tags,
            coverImage: nextCoverImage,
            coverImageAlt: nextCoverImageAlt,
            wordCount,
            published,
            featured,
          },
        }),
        ...existing.images.map((image) =>
          prisma.postImage.update({
            where: { id: image.id },
            data: {
              url: rewriteImageRoute(image.url, originalSlug, slug),
            },
          })
        ),
      ]);
    } else {
      try {
        await prisma.post.update({
          where: { slug: originalSlug },
          data: {
            slug,
            title,
            excerpt,
            content: nextContent,
            category,
            tags,
            coverImage: nextCoverImage,
            coverImageAlt: nextCoverImageAlt,
            wordCount,
            published,
            featured,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new Error(`A post with slug "${slug}" already exists.`);
        }

        throw error;
      }
    }
  }

  await ensureStatsFileSafely(slug);

  revalidatePath("/blog");
  revalidatePath("/blog/admin");
  revalidatePath(`/blog/${originalSlug}`);
  revalidatePath(`/blog/${slug}`);
  revalidatePath(`/blog/admin/${originalSlug}`);
  revalidatePath(`/blog/admin/${slug}`);

  redirect(`/blog/admin/${slug}?message=updated`);
}

export async function deletePost(formData: FormData) {
  const slug = String(formData.get("slug") || "").trim();

  if (!slug) {
    throw new Error("Missing slug.");
  }

  const existing = await prisma.post.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!existing) {
    throw new Error(`Post "${slug}" not found.`);
  }

  await prisma.post.delete({
    where: { slug },
  });

  revalidatePath("/blog");
  revalidatePath("/blog/admin");
  revalidatePath(`/blog/${slug}`);
  revalidatePath(`/blog/admin/${slug}`);

  redirect(`/blog/admin?message=deleted&slug=${encodeURIComponent(slug)}`);
}