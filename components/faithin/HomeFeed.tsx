"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { fetchPublicFeed } from "@/lib/faithin/posts";
import type { FeedPost } from "@/lib/faithin/types";
import { useFaithInAuth, signOutOfFaithIn } from "./useFaithInAuth";
import { SignInPanel } from "./SignInPanel";
import { PostCard } from "./PostCard";
import { FeedSkeleton } from "./FeedSkeleton";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; posts: FeedPost[] }
  | { status: "error"; message: string };

function describeFailure(cause: unknown): string {
  const code = (cause as { code?: string })?.code;
  if (code === "permission-denied") return "You do not have permission to read this feed.";
  if (code === "unavailable") return "Cannot reach the database. Check your connection.";
  return "We could not load the feed. Please try again.";
}

export function HomeFeed() {
  const auth = useFaithInAuth();
  const [feed, setFeed] = useState<LoadState>({ status: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  // The read is awaited before any state update, so nothing is set
  // synchronously during the effect, and a late response after unmount (or
  // after a retry supersedes it) is discarded.
  useEffect(() => {
    if (auth.status !== "signed-in") return;

    let cancelled = false;

    void (async () => {
      if (!db) {
        if (!cancelled) {
          setFeed({
            status: "error",
            message: "The database is not configured for this deployment.",
          });
        }
        return;
      }
      try {
        const posts = await fetchPublicFeed(db);
        if (!cancelled) setFeed({ status: "ready", posts });
      } catch (cause) {
        if (!cancelled) setFeed({ status: "error", message: describeFailure(cause) });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [auth.status, reloadToken]);

  const retry = useCallback(() => {
    setFeed({ status: "loading" });
    setReloadToken((token) => token + 1);
  }, []);

  if (auth.status === "loading") {
    return (
      <div className="mx-auto w-full max-w-[600px] px-3 py-6 sm:px-4">
        <FeedSkeleton />
      </div>
    );
  }

  if (auth.status === "unavailable") {
    return (
      <div className="mx-auto w-full max-w-[520px] px-4 py-16">
        <div className="card p-6">
          <h1 className="text-[18px] font-bold">Faith In is not configured</h1>
          <p className="mt-2 text-[14px] text-muted">
            The Firebase environment variables are missing from this deployment. Add them under
            Vercel → Settings → Environment Variables, then redeploy.
          </p>
        </div>
      </div>
    );
  }

  if (auth.status === "signed-out") {
    return (
      <div className="px-4 pb-16">
        <SignInPanel />
      </div>
    );
  }

  const displayName = auth.user.displayName || auth.user.email || "Faith In member";

  return (
    <div className="mx-auto w-full max-w-[600px] px-3 py-6 sm:px-4">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[20px] font-bold leading-tight">Home feed</h1>
          <p className="truncate text-[13px] text-muted">Signed in as {displayName}</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => void signOutOfFaithIn()}>
          Sign out
        </button>
      </header>

      {feed.status === "loading" ? <FeedSkeleton /> : null}

      {feed.status === "error" ? (
        <div className="card p-5" role="alert">
          <p className="text-[14px] font-semibold">{feed.message}</p>
          <button type="button" className="btn btn-outline mt-3" onClick={retry}>
            Try again
          </button>
        </div>
      ) : null}

      {feed.status === "ready" && feed.posts.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-[15px] font-semibold">No posts yet</p>
          <p className="mt-1 text-[13.5px] text-muted">
            Public blessings and testimonies will appear here.
          </p>
        </div>
      ) : null}

      {feed.status === "ready" && feed.posts.length > 0 ? (
        <div className="space-y-4">
          {feed.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
