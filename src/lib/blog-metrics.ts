import fs from "fs/promises";
import path from "path";

const statsDir = path.join(process.cwd(), "content", "blog-stats");

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

function statsPath(slug: string) {
  return path.join(statsDir, `${slug}.json`);
}

function defaultStats(): BlogStats {
  return {
    views: 0,
    likes: 0,
    comments: [],
  };
}

export async function ensurePostStatsFile(slug: string) {
  await fs.mkdir(statsDir, { recursive: true });

  const file = statsPath(slug);

  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, JSON.stringify(defaultStats(), null, 2), "utf8");
  }
}

export async function getPostStats(slug: string): Promise<BlogStats> {
  await ensurePostStatsFile(slug);

  try {
    const raw = await fs.readFile(statsPath(slug), "utf8");
    const parsed = JSON.parse(raw) as Partial<BlogStats>;

    return {
      views: Number(parsed.views ?? 0),
      likes: Number(parsed.likes ?? 0),
      comments: Array.isArray(parsed.comments) ? parsed.comments : [],
    };
  } catch {
    return defaultStats();
  }
}

async function writeStats(slug: string, stats: BlogStats) {
  await fs.mkdir(statsDir, { recursive: true });
  await fs.writeFile(statsPath(slug), JSON.stringify(stats, null, 2), "utf8");
}

export async function incrementView(slug: string) {
  const stats = await getPostStats(slug);
  stats.views += 1;
  await writeStats(slug, stats);
  return stats;
}

export async function incrementLike(slug: string) {
  const stats = await getPostStats(slug);
  stats.likes += 1;
  await writeStats(slug, stats);
  return stats;
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

  const stats = await getPostStats(slug);

  stats.comments.unshift({
    id: crypto.randomUUID(),
    name,
    message,
    createdAt: new Date().toISOString(),
  });

  await writeStats(slug, stats);
  return stats;
}