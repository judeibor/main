"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import path from "path";
import { mkdir, rm, rename, writeFile } from "fs/promises";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensurePostStatsFile } from "@/lib/blog-metrics";
import { countWords, parseTags, slugify } from "@/lib/blog-utils";

const blogAssetsRoot = path.join(process.cwd(), "public", "blog");

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

async function saveImagesForSlug(slug: string, files: File[]) {
  const postAssetsDir = path.join(blogAssetsRoot, slug);
  await mkdir(postAssetsDir, { recursive: true });

  const imagePaths: string[] = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const fileName = safeImageFileName(file.name, index);
    const filePath = path.join(postAssetsDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    imagePaths.push(`/blog/${slug}/${fileName}`);
  }

  return imagePaths;
}

async function renamePostAssetsFolder(fromSlug: string, toSlug: string) {
  const fromDir = path.join(blogAssetsRoot, fromSlug);
  const toDir = path.join(blogAssetsRoot, toSlug);

  try {
    await rename(fromDir, toDir);
  } catch {
    // Folder may not exist or rename may fail on some environments.
  }
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

  const imagePaths =
    uploadedImages.length > 0 ? await saveImagesForSlug(slug, uploadedImages) : [];

  const now = new Date();
  const wordCount = countWords(`${title} ${excerpt} ${content}`);
  const coverImage = imagePaths[0] ?? null;
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
          imagePaths.length > 0
            ? {
                create: imagePaths.map((url, index) => ({
                  url,
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

  await ensurePostStatsFile(slug);

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
    await rm(path.join(blogAssetsRoot, originalSlug), {
      recursive: true,
      force: true,
    });

    const imagePaths = await saveImagesForSlug(slug, uploadedImages);
    const coverImage = imagePaths[0] ?? null;
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
            create: imagePaths.map((url, index) => ({
              url,
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
    const nextCoverImage = existing.coverImage
      ? slugChanged
        ? existing.coverImage.replaceAll(`/blog/${originalSlug}/`, `/blog/${slug}/`)
        : existing.coverImage
      : null;

    const nextCoverImageAlt = nextCoverImage
      ? coverImageAltInput || existing.coverImageAlt || title
      : null;

    if (slugChanged) {
      await renamePostAssetsFolder(originalSlug, slug);
    }

    try {
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
        ...(slugChanged
          ? existing.images.map((image) =>
              prisma.postImage.update({
                where: { id: image.id },
                data: {
                  url: image.url.replaceAll(`/blog/${originalSlug}/`, `/blog/${slug}/`),
                },
              })
            )
          : []),
      ]);
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

  await ensurePostStatsFile(slug);

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

  await rm(path.join(blogAssetsRoot, slug), {
    recursive: true,
    force: true,
  });

  await prisma.post.delete({
    where: { slug },
  });

  revalidatePath("/blog");
  revalidatePath("/blog/admin");
  revalidatePath(`/blog/${slug}`);
  revalidatePath(`/blog/admin/${slug}`);

  redirect(`/blog/admin?message=deleted&slug=${encodeURIComponent(slug)}`);
}