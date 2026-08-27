/**
 * Firestore reads for the Faith In member experience.
 *
 * Every query here is backed by a composite index declared in
 * firestore.indexes.json, and stays inside what firestore.rules permits
 * (`allow read: if isSignedIn()`), so an unauthenticated caller is rejected by
 * the database rather than by the UI.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  where,
  type DocumentData,
  type Firestore,
  type Timestamp,
} from "firebase/firestore";

import type { FeedPost, PostAuthor, PublicProfile, PostVisibility } from "./types";

const DEFAULT_PAGE_SIZE = 20;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asDate(value: unknown): Date | null {
  if (!value) return null;
  const stamp = value as Partial<Timestamp>;
  if (typeof stamp.toDate === "function") return stamp.toDate();
  if (value instanceof Date) return value;
  return null;
}

/** Reactions are stored as a map of reaction name -> count. */
function countReactions(value: unknown): number {
  if (!value || typeof value !== "object") return 0;
  return Object.values(value as Record<string, unknown>).reduce<number>(
    (total, entry) => total + (typeof entry === "number" ? entry : 0),
    0,
  );
}

function normaliseAuthor(data: DocumentData): PostAuthor {
  const author = (data.author ?? {}) as DocumentData;
  return {
    uid: asString(author.uid ?? data.authorUid),
    displayName: asString(author.displayName ?? author.name, "Faith In member"),
    photoURL: asString(author.photoURL) || null,
    role: asString(author.role) || null,
  };
}

function normalisePost(id: string, data: DocumentData): FeedPost {
  const visibility = asString(data.visibility, "public");
  return {
    id,
    author: normaliseAuthor(data),
    type: asString(data.type, "post"),
    title: asString(data.title ?? data.article_title),
    excerpt: asString(data.excerpt ?? data.article_excerpt),
    content: asString(data.content ?? data.article_body),
    coverImageUrl: asString(data.cover_image_url) || null,
    mediaItems: Array.isArray(data.media_items)
      ? data.media_items.filter((item): item is string => typeof item === "string")
      : [],
    visibility: (["public", "private", "followers"].includes(visibility)
      ? visibility
      : "public") as PostVisibility,
    reactionCount: countReactions(data.reactions),
    commentCount: asCount(data.comment_count),
    shareCount: asCount(data.share_count),
    createdAt: asDate(data.createdAt),
  };
}

/**
 * Public feed, newest first.
 * Index: posts(visibility ASC, createdAt DESC).
 */
export async function fetchPublicFeed(
  db: Firestore,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<FeedPost[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "posts"),
      where("visibility", "==", "public"),
      orderBy("createdAt", "desc"),
      fsLimit(pageSize),
    ),
  );
  return snapshot.docs.map((entry) => normalisePost(entry.id, entry.data()));
}

/**
 * A single member's posts, newest first.
 * Index: posts(authorUid ASC, createdAt DESC).
 */
export async function fetchPostsByAuthor(
  db: Firestore,
  authorUid: string,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<FeedPost[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "posts"),
      where("authorUid", "==", authorUid),
      orderBy("createdAt", "desc"),
      fsLimit(pageSize),
    ),
  );
  return snapshot.docs.map((entry) => normalisePost(entry.id, entry.data()));
}

/** Public profile document for a member. Readable by any signed-in user. */
export async function fetchPublicProfile(
  db: Firestore,
  uid: string,
): Promise<PublicProfile | null> {
  const snapshot = await getDoc(doc(db, "publicProfiles", uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    uid,
    displayName: asString(data.displayName, "Faith In member"),
    photoURL: asString(data.photoURL) || null,
    coverURL: asString(data.coverURL) || null,
    bio: asString(data.bio) || null,
    role: asString(data.role) || null,
    location: asString(data.location) || null,
    church: asString(data.church) || null,
    ministry: asString(data.ministry) || null,
  };
}
