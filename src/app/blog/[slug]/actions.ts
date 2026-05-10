"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function getSlug(formData: FormData) {
  return String(formData.get("slug") || "").trim();
}

function getCommentName(formData: FormData) {
  return String(formData.get("name") || "").trim() || "Anonymous";
}

function getCommentMessage(formData: FormData) {
  return String(formData.get("message") || "").trim();
}

export async function likePost(formData: FormData) {
  const slug = getSlug(formData);

  if (!slug) {
    throw new Error("Missing slug.");
  }

  await prisma.post.update({
    where: { slug },
    data: {
      stats: {
        upsert: {
          create: {
            likes: 1,
            views: 0,
          },
          update: {
            likes: {
              increment: 1,
            },
          },
        },
      },
    },
  });

  revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog");

  redirect(`/blog/${slug}?message=liked`);
}

export async function addComment(formData: FormData) {
  const slug = getSlug(formData);
  const name = getCommentName(formData);
  const message = getCommentMessage(formData);

  if (!slug) {
    throw new Error("Missing slug.");
  }

  if (!message) {
    throw new Error("Comment cannot be empty.");
  }

  await prisma.post.update({
    where: { slug },
    data: {
      stats: {
        upsert: {
          create: {
            likes: 0,
            views: 0,
            comments: {
              create: {
                name,
                message,
              },
            },
          },
          update: {
            comments: {
              create: {
                name,
                message,
              },
            },
          },
        },
      },
    },
  });

  revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog");

  redirect(`/blog/${slug}?message=commented`);
}