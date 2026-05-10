"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import path from "path";
import { copy, del, put } from "@vercel/blob";
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

function isRemoteUrl(value: string) {
  return /^https?:\/\//i.test(value);
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

function getBlobPath(slug: string, fileName: string) {
  return `blog/${slug}/${fileName}`;
}

function getFileNameFromUrl(urlOrPathname: string, index: number) {
  try {
    const pathname = isRemoteUrl(urlOrPathname)
      ? new URL(urlOrPathname).pathname
      : urlOrPathname;

    const fileName = path.posix.basename(pathname);

    return fileName || `image-${index + 1}.jpg`;
  } catch {
    return `image-${index + 1}.jpg`;
  }
}

async function deleteBlobUrls(urls: string[]) {
  const remoteUrls = urls.filter(isRemoteUrl);

  if (remoteUrls.length === 0) return;

  try {
    await del(remoteUrls);
  } catch (error) {
    console.error("Failed to delete blob(s):", error);
  }
}

async function uploadImagesForSlug(slug: string, files: File[]) {
  const uploaded: Array<{ url: string; pathname: string }> = [];

  try {
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const fileName = safeImageFileName(file.name, index);
      const pathname = getBlobPath(slug, fileName);

      const blob = await put(pathname, file, {
        access: "public",
        addRandomSuffix: false,
      });

      uploaded.push({
        url: blob.url,
        pathname: blob.pathname,
      });
    }
  } catch (error) {
    await deleteBlobUrls(uploaded.map((blob) => blob.url));
    throw error;
  }

  return uploaded;
}

async function copyImagesToSlug(
  existingImages: { url: string }[],
  slug: string
) {
  const copied: Array<{ url: string; pathname: string }> = [];

  try {
    for (let index = 0; index < existingImages.length; index += 1) {
      const image = existingImages[index];

      if (!isRemoteUrl(image.url)) {
        continue;
      }

      const fileName = getFileNameFromUrl(image.url, index);
      const pathname = getBlobPath(slug, fileName);

      const blob = await copy(image.url, pathname, {
        access: "public",
      });

      copied.push({
        url: blob.url,
        pathname: blob.pathname,
      });
    }
  } catch (error) {
    await deleteBlobUrls(copied.map((blob) => blob.url));
    throw error;
  }

  return copied;
}

async function ensureStatsFileSafely(slug: string) {
  try {
    await ensurePostStatsFile(slug);
  } catch (error) {
    console.error(`Failed to ensure stats file for "${slug}":`, error);
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

  const now = new Date();
  const wordCount = countWords(`${title} ${excerpt} ${content}`);

  const uploadedBlobs =
    uploadedImages.length > 0 ? await uploadImagesForSlug(slug, uploadedImages) : [];

  const coverImage = uploadedBlobs[0]?.url ?? null;
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
          uploadedBlobs.length > 0
            ? {
                create: uploadedBlobs.map((blob, index) => ({
                  url: blob.url,
                  alt: index === 0 ? coverImageAlt : null,
                })),
              }
            : undefined,
      },
    });
  } catch (error) {
    await deleteBlobUrls(uploadedBlobs.map((blob) => blob.url));

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
    await deleteBlobUrls(existing.images.map((image) => image.url));

    const uploadedBlobs = await uploadImagesForSlug(slug, uploadedImages);
    const coverImage = uploadedBlobs[0]?.url ?? null;
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
            create: uploadedBlobs.map((blob, index) => ({
              url: blob.url,
              alt: index === 0 ? coverImageAlt : null,
            })),
          },
        },
      });
    } catch (error) {
      await deleteBlobUrls(uploadedBlobs.map((blob) => blob.url));

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error(`A post with slug "${slug}" already exists.`);
      }

      throw error;
    }
  } else {
    const canMigrateBlobImages = existing.images.every((image) =>
      isRemoteUrl(image.url)
    );

    if (slugChanged && canMigrateBlobImages && existing.images.length > 0) {
      const copiedBlobs = await copyImagesToSlug(existing.images, slug);
      const nextCoverImage = copiedBlobs[0]?.url ?? existing.coverImage ?? null;
      const nextCoverImageAlt = nextCoverImage
        ? coverImageAltInput || existing.coverImageAlt || title
        : null;

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
          ...copiedBlobs.map((blob, index) =>
            prisma.postImage.update({
              where: { id: existing.images[index].id },
              data: {
                url: blob.url,
                alt: index === 0 ? nextCoverImageAlt : null,
              },
            })
          ),
        ]);
      } catch (error) {
        await deleteBlobUrls(copiedBlobs.map((blob) => blob.url));

        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new Error(`A post with slug "${slug}" already exists.`);
        }

        throw error;
      }

      await deleteBlobUrls(existing.images.map((image) => image.url));
    } else {
      const nextCoverImage = existing.coverImage ?? null;
      const nextCoverImageAlt = nextCoverImage
        ? coverImageAltInput || existing.coverImageAlt || title
        : null;

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
    include: {
      images: {
        select: {
          url: true,
        },
      },
    },
  });

  if (!existing) {
    throw new Error(`Post "${slug}" not found.`);
  }

  await deleteBlobUrls(existing.images.map((image) => image.url));

  await prisma.post.delete({
    where: { slug },
  });

  revalidatePath("/blog");
  revalidatePath("/blog/admin");
  revalidatePath(`/blog/${slug}`);
  revalidatePath(`/blog/admin/${slug}`);

  redirect(`/blog/admin?message=deleted&slug=${encodeURIComponent(slug)}`);
}