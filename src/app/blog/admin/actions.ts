"use server";

import { revalidatePath } from "next/cache";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { ensurePostStatsFile } from "@/lib/blog-metrics";

const blogDir = path.join(process.cwd(), "content", "blog");
const blogAssetsRoot = path.join(process.cwd(), "public", "blog");

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseTags(raw: string) {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function isSafeSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function yamlString(value: string) {
  return JSON.stringify(value);
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

export async function createPost(formData: FormData) {
  const rawSlug = String(formData.get("slug") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const category = String(formData.get("category") || "General").trim();
  const tags = parseTags(String(formData.get("tags") || ""));
  const coverImageAlt = String(formData.get("coverImageAlt") || "").trim();
  const content = String(formData.get("content") || "").trim();

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

  await mkdir(blogDir, { recursive: true });

  const postAssetsDir = path.join(blogAssetsRoot, slug);
  await mkdir(postAssetsDir, { recursive: true });

  const imagePaths: string[] = [];

  for (let index = 0; index < uploadedImages.length; index += 1) {
    const file = uploadedImages[index];
    const fileName = safeImageFileName(file.name, index);
    const filePath = path.join(postAssetsDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    imagePaths.push(`/blog/${slug}/${fileName}`);
  }

  const now = new Date().toISOString();
  const coverImage = imagePaths[0] ?? "";

  const frontmatterLines = [
    "---",
    `title: ${yamlString(title)}`,
    `excerpt: ${yamlString(excerpt)}`,
    `publishedAt: ${yamlString(now)}`,
    `updatedAt: ${yamlString(now)}`,
    `category: ${yamlString(category)}`,
    `tags:`,
    ...tags.map((tag) => `  - ${yamlString(tag)}`),
    imagePaths.length > 0 ? `images:` : "",
    ...imagePaths.map((image) => `  - ${yamlString(image)}`),
    coverImage ? `coverImage: ${yamlString(coverImage)}` : "",
    coverImage && coverImageAlt ? `coverImageAlt: ${yamlString(coverImageAlt)}` : "",
    "---",
    "",
    content,
    "",
  ].filter(Boolean);

  const filePath = path.join(blogDir, `${slug}.mdx`);
  await writeFile(filePath, frontmatterLines.join("\n"), "utf8");

  await ensurePostStatsFile(slug);

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
}