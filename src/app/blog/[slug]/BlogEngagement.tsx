"use client";

import { useEffect, useMemo, useState } from "react";

type BlogComment = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

type Props = {
  slug: string;
  initialViews: number;
  initialLikes: number;
  initialLiked: boolean;
  initialComments: BlogComment[];
};

type ViewResponse = {
  views: number;
  recorded: boolean;
};

type LikeResponse = {
  likes: number;
  liked: boolean;
};

type CommentResponse = {
  comment: BlogComment;
};

function EyeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function HeartIcon({
  className = "",
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.53L12 21.35z" />
    </svg>
  );
}

function CommentIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M21 15a4 4 0 0 1-4 4H9l-6 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    </svg>
  );
}

function formatTimeAgo(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);

  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  const years = Math.floor(months / 12);

  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export function BlogEngagement({
  slug,
  initialViews,
  initialLikes,
  initialLiked,
  initialComments,
}: Props) {
  const [views, setViews] = useState(initialViews);
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [comments, setComments] = useState<BlogComment[]>(initialComments);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [likeBurst, setLikeBurst] = useState(false);

  const commentCount = comments.length;

  useEffect(() => {
    let active = true;

    const recordView = async () => {
      try {
        const response = await fetch(`/blog/${slug}/view`, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        });

        const data: ViewResponse = await response.json();

        if (!active) return;

        if (typeof data.views === "number") {
          setViews(data.views);
        }
      } catch {
        // keep initial count on network errors
      }
    };

    recordView();

    return () => {
      active = false;
    };
  }, [slug]);

  async function handleLike() {
    if (isLiking) return;

    const previousLikes = likes;
    const previousLiked = liked;

    setIsLiking(true);
    setLikeBurst(true);
    setLikes((current) => current + (liked ? -1 : 1));
    setLiked((current) => !current);

    window.setTimeout(() => {
      setLikeBurst(false);
    }, 450);

    try {
      const response = await fetch(`/blog/${slug}/like`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      const data: LikeResponse = await response.json();

      if (!response.ok) {
        throw new Error("Like request failed.");
      }

      setLikes(data.likes);
      setLiked(data.liked);
      setFeedback(data.liked ? "Liked." : "Like removed.");
    } catch {
      setLikes(previousLikes);
      setLiked(previousLiked);
      setFeedback("Like failed. Try again.");
    } finally {
      setIsLiking(false);
    }
  }

  async function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();
    const trimmedName = name.trim() || "Anonymous";

    if (!trimmedMessage || isCommenting) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticComment: BlogComment = {
      id: tempId,
      name: trimmedName,
      message: trimmedMessage,
      createdAt: new Date().toISOString(),
    };

    setIsCommenting(true);
    setFeedback(null);
    setComments((current) => [optimisticComment, ...current]);
    setMessage("");

    try {
      const response = await fetch(`/blog/${slug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          message: trimmedMessage,
        }),
      });

      const data: CommentResponse = await response.json();

      if (!response.ok) {
        throw new Error("Comment failed.");
      }

      setComments((current) =>
        current.map((comment) =>
          comment.id === tempId ? data.comment : comment
        )
      );
      setFeedback("Comment posted.");
    } catch {
      setComments((current) =>
        current.filter((comment) => comment.id !== tempId)
      );
      setMessage(trimmedMessage);
      setFeedback("Comment failed. Try again.");
    } finally {
      setIsCommenting(false);
    }
  }

  const likeButtonLabel = useMemo(() => {
    return liked ? "Liked" : "Like";
  }, [liked]);

  return (
    <section
      id="comments"
      className="mt-10 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Engage
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Like the post and leave a comment below.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-zinc-600 dark:text-zinc-300">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1 dark:border-zinc-800">
            <EyeIcon className="h-4 w-4" />
            <span>{views}</span>
            <span className="sr-only">views</span>
          </span>

          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1 dark:border-zinc-800">
            <HeartIcon className="h-4 w-4 text-rose-500" filled />
            <span>{likes}</span>
            <span className="sr-only">likes</span>
          </span>

          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1 dark:border-zinc-800">
            <CommentIcon className="h-4 w-4" />
            <span>{commentCount}</span>
            <span className="sr-only">comments</span>
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleLike}
          disabled={isLiking}
          aria-pressed={liked}
          className="group inline-flex items-center gap-3 rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <span className="relative inline-flex h-6 w-6 items-center justify-center">
            {likeBurst ? (
              <span className="absolute inset-0 rounded-full bg-rose-500/15 animate-ping" />
            ) : null}
            <HeartIcon
              className={`relative h-5 w-5 transition-transform duration-200 ${
                likeBurst ? "scale-125" : "scale-100"
              } ${liked ? "text-rose-600" : "text-zinc-500"}`}
              filled={liked}
            />
          </span>

          <span>{isLiking ? "Updating..." : likeButtonLabel}</span>
          <span className="text-zinc-400">·</span>
          <span>{likes}</span>
        </button>

        <a
          href="#comment-form"
          className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <CommentIcon className="mr-2 h-4 w-4" />
          Comment
        </a>
      </div>

      {feedback ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
          {feedback}
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/30">
          <h3
            id="comment-form"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Leave a comment
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Add your name and message. The comment appears immediately after posting.
          </p>

          <form onSubmit={handleCommentSubmit} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  Name
                </label>
                <input
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Anonymous"
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
                />
              </div>

              <div className="sm:pt-7">
                <button
                  type="submit"
                  disabled={isCommenting}
                  className="inline-flex w-full items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  {isCommenting ? "Posting..." : "Post comment"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Comment
              </label>
              <textarea
                name="message"
                required
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write your comment here..."
                className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
              />
            </div>
          </form>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Comments
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            {commentCount} total
          </p>

          <div className="mt-5 space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {comment.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatTimeAgo(comment.createdAt)}
                    </p>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {comment.message}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                No comments yet. Be the first to add one.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}