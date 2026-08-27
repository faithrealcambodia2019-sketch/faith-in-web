import type { FeedPost } from "@/lib/faithin/types";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "FI";
}

function relativeTime(value: Date | null): string {
  if (!value) return "";
  const seconds = Math.round((Date.now() - value.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  return value.toLocaleDateString();
}

export function PostCard({ post }: { post: FeedPost }) {
  const body = post.content || post.excerpt;

  return (
    <article className="card overflow-hidden">
      <header className="flex items-start gap-3 p-4 pb-2.5">
        {post.author.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.author.photoURL}
            alt=""
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="avatar h-11 w-11 text-[14px]">{initials(post.author.displayName)}</span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14.5px] font-semibold">{post.author.displayName}</span>
            {post.type && post.type !== "post" ? (
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-brand-strong">
                {post.type}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-[12px] text-muted">
            {[relativeTime(post.createdAt), post.author.role].filter(Boolean).join(" · ")}
          </p>
        </div>
      </header>

      {post.title ? (
        <h2 className="px-4 pb-1 text-[16px] font-semibold leading-snug">{post.title}</h2>
      ) : null}

      {body ? (
        <div className="px-4 pb-3">
          <p className="whitespace-pre-line text-[14.5px] leading-relaxed text-ink/90">{body}</p>
        </div>
      ) : null}

      {post.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImageUrl}
          alt=""
          className="max-h-[420px] w-full border-y border-line object-cover"
          loading="lazy"
        />
      ) : null}

      <div className="flex items-center justify-between border-t border-line px-4 py-2 text-[12px] text-muted">
        <span>{post.reactionCount} amen</span>
        <span className="flex gap-3">
          <span>{post.commentCount} comments</span>
          <span>{post.shareCount} shares</span>
        </span>
      </div>
    </article>
  );
}
