"use server";

import { revalidatePath } from "next/cache";
import {
  addComment,
  incrementLike,
  incrementView,
} from "@/lib/blog-metrics";

export async function trackPostView(slug: string) {
  await incrementView(slug);
  revalidatePath(`/blog/${slug}`);
}

export async function likePost(slug: string) {
  await incrementLike(slug);
  revalidatePath(`/blog/${slug}`);
}

export async function commentOnPost(formData: FormData) {
  const slug = String(formData.get("slug") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!slug) {
    throw new Error("Missing slug");
  }

  await addComment(slug, { name, message });
  revalidatePath(`/blog/${slug}`);
}