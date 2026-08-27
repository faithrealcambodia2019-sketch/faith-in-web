/**
 * Shapes for the Faith In member experience.
 *
 * These mirror the documents validated by firestore.rules. Firestore is
 * schemaless, so every field is treated as possibly absent and normalised in
 * lib/faithin/posts.ts before it reaches a component.
 */

export type PostVisibility = "public" | "private" | "followers";

export type PostAuthor = {
  uid: string;
  displayName: string;
  photoURL: string | null;
  role: string | null;
};

export type FeedPost = {
  id: string;
  author: PostAuthor;
  type: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  mediaItems: string[];
  visibility: PostVisibility;
  reactionCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: Date | null;
};

export type PublicProfile = {
  uid: string;
  displayName: string;
  photoURL: string | null;
  coverURL: string | null;
  bio: string | null;
  role: string | null;
  location: string | null;
  church: string | null;
  ministry: string | null;
};
