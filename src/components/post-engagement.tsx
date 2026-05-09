"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { likePost, commentOnPost, trackPostView } from "@/app/blog/[slug]/engagement-actions";
import type { BlogComment, BlogStats } from "@/lib/blog-metrics";

type Props = {
  slug: string;
  initialViews: number;
  initialLikes: number;
  initialComments: BlogComment[];
};

async function fetchLatestStats(slug: string): Promise<BlogStats | null> {
  try {
    const res = await fetch(`/api/blog/${slug}/stats`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    if (!res.ok) return null;

    return (await res.json()) as BlogStats;
  } catch {
    return null;
  }
}

export function PostEngagement({
  slug,
  initialViews,
  initialLikes,
  initialComments,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [views, setViews] = useState(initialViews);
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const trackedViewRef = useRef(false);
  const pollRef = useRef<number | null>(null);

  async function syncStats() {
    const latest = await fetchLatestStats(slug);
    if (!latest) return;

    setViews(latest.views);
    setLikes(latest.likes);
    setComments(latest.comments);
  }

  useEffect(() => {
    let alive = true;

    const init = async () => {
      const latest = await fetchLatestStats(slug);
      if (alive && latest) {
        setViews(latest.views);
        setLikes(latest.likes);
        setComments(latest.comments);
      }

      if (!trackedViewRef.current) {
        trackedViewRef.current = true;
        await trackPostView(slug);
        await syncStats();
      }
    };

    void init();

    pollRef.current = window.setInterval(() => {
      void syncStats();
    }, 3000);

    return () => {
      alive = false;
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [slug]);

  async function handleLike() {
    setLikes((v) => v + 1);

    try {
      await likePost(slug);
      await syncStats();
    } catch {
      await syncStats();
    }
  }

  async function handleComment(formData: FormData) {
    formData.set("slug", slug);

    const optimisticName = String(formData.get("name") || "").trim();
    const optimisticMessage = String(formData.get("message") || "").trim();

    if (optimisticName && optimisticMessage) {
      setComments((current) => [
        {
          id: `temp-${Date.now()}`,
          name: optimisticName,
          message: optimisticMessage,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
    }

    try {
      await commentOnPost(formData);
      setName("");
      setMessage("");
      await syncStats();
    } catch {
      await syncStats();
    }
  }

  return (
    <section className="mt-12 space-y-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
        <span>{views} views</span>
        <span>•</span>
        <span>{likes} likes</span>
        <span>•</span>
        <span>{comments.length} comments</span>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleLike}
          disabled={isPending}
          className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950"
        >
          Like post
        </button>
      </div>

      <form action={handleComment} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-2xl border border-zinc-300 bg-transparent px-4 py-3 text-sm outline-none dark:border-zinc-700"
          />
          <input
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a comment"
            className="w-full rounded-2xl border border-zinc-300 bg-transparent px-4 py-3 text-sm outline-none dark:border-zinc-700"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium disabled:opacity-60 dark:border-zinc-800"
        >
          Add comment
        </button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <article
            key={comment.id}
            className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {comment.name}
            </p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              {comment.message}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}