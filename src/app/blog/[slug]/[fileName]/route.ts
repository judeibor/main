import path from "path";
import { readFile } from "fs/promises";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    slug: string;
    fileName: string;
  };
};

export const runtime = "nodejs";

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

export async function GET(_: Request, { params }: RouteContext) {
  const slug = params.slug;
  const fileName = decodeURIComponent(params.fileName);

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
    return new Response(image.data, {
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

  return new Response(legacyBytes, {
    status: 200,
    headers: {
      "Content-Type": image.mimeType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}