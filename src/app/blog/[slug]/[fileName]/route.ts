import path from "path";
import { readFile } from "fs/promises";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteParams = Promise<{
  slug: string;
  fileName: string;
}>;

function getImageFromPost(
  images: {
    url: string;
    fileName: string | null;
    mimeType: string | null;
    data: Buffer | Uint8Array | null;
  }[],
  fileName: string
) {
  return images.find((image) => {
    if (image.fileName && image.fileName === fileName) {
      return true;
    }

    const fromUrl = path.posix.basename(image.url);
    return fromUrl === fileName;
  });
}

async function tryLegacyFile(slug: string, fileName: string) {
  const legacyPath = path.join(process.cwd(), "public", "blog", slug, fileName);

  try {
    return await readFile(legacyPath);
  } catch {
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: RouteParams }
) {
  const { slug, fileName: encodedFileName } = await params;
  const fileName = decodeURIComponent(encodedFileName);

  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      images: {
        select: {
          url: true,
          fileName: true,
          mimeType: true,
          data: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const image = getImageFromPost(post.images, fileName);

  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  if (image.data) {
    return new Response(new Uint8Array(image.data), {
      status: 200,
      headers: {
        "Content-Type": image.mimeType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const legacyBytes = await tryLegacyFile(slug, fileName);

  if (!legacyBytes) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(legacyBytes), {
    status: 200,
    headers: {
      "Content-Type": image.mimeType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}