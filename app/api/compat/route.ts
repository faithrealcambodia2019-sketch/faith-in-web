import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages, notifications, posts, prayers, profiles, users } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 1_048_576;
const MAX_ACTION_LENGTH = 100;
const MAX_POST_LENGTH = 10_000;
const MAX_MESSAGE_LENGTH = 4_000;
const MAX_SEARCH_LENGTH = 120;

type Payload = Record<string, unknown>;
type CompatUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};
type CompatSession = { user?: CompatUser } | null;

class RequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, data: message }, { status });
}

function textValue(value: unknown, maxLength: number, trim = true) {
  const result = typeof value === "string" ? value : value == null ? "" : String(value);
  return (trim ? result.trim() : result).slice(0, maxLength);
}

function payloadText(payload: Payload, key: string, maxLength: number, trim = true) {
  return textValue(payload[key], maxLength, trim);
}

function attachmentValue(value: unknown) {
  if (value == null || value === "") return null;
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  if (serialized.length > 100_000) {
    throw new RequestError("That attachment is too large to send.", 400);
  }
  return serialized;
}

function threadRecipient(payload: Payload) {
  const threadId = payloadText(payload, "thread_id", 250);
  const recipientUid =
    payloadText(payload, "recipient_uid", 160) || threadId.replace(/^thread-/, "").slice(0, 160);
  return { threadId, recipientUid };
}

async function parseRequest(req: NextRequest) {
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    throw new RequestError("This request is too large.", 413);
  }

  const contentType = (req.headers.get("content-type") || "").toLowerCase();
  const payload: Payload = {};

  if (
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded")
  ) {
    const formData = await req.formData();
    for (const [key, value] of formData.entries()) payload[key] = value;
  } else if (contentType.includes("application/json")) {
    let data: unknown;
    try {
      data = await req.json();
    } catch {
      throw new RequestError("Send a valid JSON request.", 400);
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new RequestError("Send a valid request object.", 400);
    }
    Object.assign(payload, data);
  } else {
    throw new RequestError("Use JSON or form data for this request.", 415);
  }

  const action = payloadText(payload, "action", MAX_ACTION_LENGTH);
  if (!action) throw new RequestError("No action provided.", 400);
  if (!/^cv_[a-z0-9_]+$/.test(action)) throw new RequestError("That action is not valid.", 400);
  return { action, payload };
}

function databaseReady() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function authReady() {
  return Boolean(process.env.AUTH_SECRET?.trim());
}

async function readSession(): Promise<CompatSession> {
  if (!authReady()) {
    throw new RequestError("The optional server sign-in backend is not configured.", 503);
  }
  const { auth } = await import("@/auth");
  return (await auth()) as CompatSession;
}

function requireSessionUser(session: CompatSession) {
  const id = session?.user?.id;
  if (!id) throw new RequestError("Please sign in to continue.", 401);
  return { ...session.user, id };
}

function serverBackendUnavailable() {
  return jsonError(
    "The optional server compatibility backend is not configured. The Firebase data backend remains available.",
    503,
  );
}

export async function POST(req: NextRequest) {
  let parsed: Awaited<ReturnType<typeof parseRequest>>;
  try {
    parsed = await parseRequest(req);
  } catch (error) {
    if (error instanceof RequestError) return jsonError(error.message, error.status);
    return jsonError("The request could not be read.", 400);
  }

  const { action, payload } = parsed;

  // Handle Bible actions without requiring Postgres database
  if (action.startsWith("cv_bible_")) {
    const {
      getBibleChapter,
      getConcordance,
      getBibleQuotes,
      getBibleMediaList,
      getDailyVerse,
    } = await import("@/lib/bible-service");

    switch (action) {
      case "cv_bible_get_verses": {
        const book = payloadText(payload, "book", 80) || "John";
        const chapter = Number(payload.chapter) || 1;
        const version = payloadText(payload, "version", 30) || "KHMER_OLD_1954";
        const chapterData = await getBibleChapter(book, chapter, version);
        return NextResponse.json({
          success: true,
          data: {
            items: chapterData.items,
            translation: chapterData.version,
            reference: `${chapterData.khmerBook} ${chapterData.chapter}`,
          },
        });
      }

      case "cv_bible_dictionary": {
        const query = payloadText(payload, "query", 100) || payloadText(payload, "q", 100);
        const result = getConcordance(query);
        return NextResponse.json({ success: true, data: result });
      }

      case "cv_bible_get_quotes": {
        const type = payloadText(payload, "type", 30) || "general";
        const result = getBibleQuotes(type);
        return NextResponse.json({ success: true, data: result });
      }

      case "cv_bible_get_media": {
        const result = getBibleMediaList();
        return NextResponse.json({ success: true, data: result });
      }

      case "cv_bible_get_daily": {
        const result = getDailyVerse();
        return NextResponse.json({ success: true, data: result });
      }

      case "cv_bible_save_notes": {
        const notes = payload.notes || {
          Doctrine: payloadText(payload, "Doctrine", 5000),
          Encouragement: payloadText(payload, "Encouragement", 5000),
          Application: payloadText(payload, "Application", 5000),
        };
        return NextResponse.json({ success: true, data: { saved: true, notes } });
      }

      case "cv_bible_get_notes": {
        return NextResponse.json({
          success: true,
          data: {
            notes: {
              Doctrine: "",
              Encouragement: "",
              Application: "",
            },
          },
        });
      }

      case "cv_bible_save_typing_score": {
        return NextResponse.json({ success: true, data: { saved: true } });
      }
    }
  }

  // Production uses the Firebase browser data layer documented in
  // docs/ARCHITECTURE.md. The Drizzle route is retained for compatibility, but
  // it must never try the localhost development fallback in a serverless run.
  if (!databaseReady()) return serverBackendUnavailable();

  try {
    let session: CompatSession = null;
    if (action !== "cv_get_posts" && action !== "cv_get_prayers") {
      session = await readSession();
    }

    switch (action) {
      case "cv_get_session": {
        if (!session?.user?.id) {
          return NextResponse.json({ success: true, data: { is_logged_in: false } });
        }
        const userProfile = await db.query.profiles.findFirst({
          where: eq(profiles.userId, session.user.id),
        });
        return NextResponse.json({
          success: true,
          data: {
            is_logged_in: true,
            user: {
              uid: session.user.id,
              name: session.user.name,
              email: session.user.email,
              avatar: session.user.image,
              headline: userProfile?.headline,
              role: "user",
            },
          },
        });
      }

      case "cv_get_posts": {
        const allPosts = await db.query.posts.findMany({
          orderBy: [desc(posts.createdAt)],
          limit: 20,
        });
        return NextResponse.json({
          success: true,
          data: allPosts.map((post) => ({
            id: post.id,
            author_uid: post.userId,
            author_name: "Faith In Member",
            type: post.type,
            content: post.content,
            created_at: post.createdAt.toISOString(),
          })),
        });
      }

      case "cv_create_post": {
        const member = requireSessionUser(session);
        const content = payloadText(payload, "content", MAX_POST_LENGTH);
        if (!content) throw new RequestError("Write something before posting.", 400);
        const requestedType = payloadText(payload, "type", 30) || "blessing";
        if (!["blessing", "testimony", "article"].includes(requestedType)) {
          throw new RequestError("Choose a valid post type.", 400);
        }
        const [newPost] = await db
          .insert(posts)
          .values({
            userId: member.id,
            content,
            type: requestedType as "blessing" | "testimony" | "article",
          })
          .returning();
        return NextResponse.json({ success: true, data: newPost });
      }

      case "cv_get_prayers": {
        const allPrayers = await db.query.prayers.findMany({
          orderBy: [desc(prayers.createdAt)],
          limit: 20,
        });
        return NextResponse.json({
          success: true,
          data: allPrayers.map((prayer) => ({
            id: prayer.id,
            author_uid: prayer.userId,
            title: prayer.title,
            content: prayer.content,
            category: prayer.category,
            is_anonymous: prayer.isAnonymous,
            created_at: prayer.createdAt.toISOString(),
          })),
        });
      }

      case "cv_social_get_message_threads": {
        const member = requireSessionUser(session);
        const myMessages = await db.query.messages.findMany({
          where: or(eq(messages.senderId, member.id), eq(messages.receiverId, member.id)),
          orderBy: [desc(messages.createdAt)],
          limit: 100,
        });
        const contactMap = new Map<string, typeof myMessages>();
        for (const message of myMessages) {
          const otherId = message.senderId === member.id ? message.receiverId : message.senderId;
          const thread = contactMap.get(otherId) || [];
          thread.push(message);
          contactMap.set(otherId, thread);
        }

        const items = await Promise.all(
          [...contactMap.entries()].map(async ([otherId, threadMessages]) => {
            const [otherUser, otherProfile] = await Promise.all([
              db.query.users.findFirst({ where: eq(users.id, otherId) }),
              db.query.profiles.findFirst({ where: eq(profiles.userId, otherId) }),
            ]);
            const lastMessage = threadMessages[0];
            return {
              id: `thread-${otherId}`,
              other_user: {
                uid: otherId,
                name: otherUser?.name || "Faith In Member",
                role: otherProfile?.headline || otherUser?.role || "Member",
                church: otherProfile?.location || "",
                avatar: otherUser?.image,
              },
              last_message: lastMessage?.content || "Sent an attachment",
              last_message_at: lastMessage?.createdAt.toISOString(),
              unread_count: threadMessages.filter(
                (message) => message.receiverId === member.id && !message.readAt,
              ).length,
              presence: { active: false },
            };
          }),
        );
        return NextResponse.json({ success: true, data: { items } });
      }

      case "cv_social_open_thread": {
        const member = requireSessionUser(session);
        const { threadId, recipientUid } = threadRecipient(payload);
        if (!recipientUid || recipientUid === member.id) {
          throw new RequestError("Choose another member to message.", 400);
        }
        const [otherUser, otherProfile] = await Promise.all([
          db.query.users.findFirst({ where: eq(users.id, recipientUid) }),
          db.query.profiles.findFirst({ where: eq(profiles.userId, recipientUid) }),
        ]);
        if (!otherUser) throw new RequestError("That member could not be found.", 404);
        return NextResponse.json({
          success: true,
          data: {
            thread_id: threadId || `thread-${recipientUid}`,
            exists: true,
            other_user: {
              uid: otherUser.id,
              name: otherUser.name || "Faith In Member",
              role: otherProfile?.headline || otherUser.role || "Member",
              avatar: otherUser.image,
            },
          },
        });
      }

      case "cv_social_get_message_thread": {
        const member = requireSessionUser(session);
        const { threadId, recipientUid } = threadRecipient(payload);
        if (!recipientUid || recipientUid === member.id) {
          throw new RequestError("That conversation could not be found.", 400);
        }
        const threadMessages = await db.query.messages.findMany({
          where: or(
            and(eq(messages.senderId, member.id), eq(messages.receiverId, recipientUid)),
            and(eq(messages.senderId, recipientUid), eq(messages.receiverId, member.id)),
          ),
          orderBy: [asc(messages.createdAt)],
          limit: 100,
        });
        return NextResponse.json({
          success: true,
          data: {
            thread_id: threadId || `thread-${recipientUid}`,
            items: threadMessages.map((message) => {
              let attachment: unknown = null;
              if (message.attachment) {
                try {
                  attachment = JSON.parse(message.attachment);
                } catch {
                  attachment = { name: "Attachment", url: message.attachment };
                }
              }
              return {
                id: message.id,
                mine: message.senderId === member.id,
                body: message.content,
                attachment,
                created_at: message.createdAt.toISOString(),
              };
            }),
          },
        });
      }

      case "cv_social_send_message": {
        const member = requireSessionUser(session);
        const { threadId, recipientUid } = threadRecipient(payload);
        const content =
          payloadText(payload, "body", MAX_MESSAGE_LENGTH) ||
          payloadText(payload, "content", MAX_MESSAGE_LENGTH);
        const attachment = attachmentValue(payload.attachment);
        if (!content && !attachment) {
          throw new RequestError("Write a message or add an attachment first.", 400);
        }
        if (!recipientUid || recipientUid === member.id) {
          throw new RequestError("Choose another member to message.", 400);
        }
        const recipient = await db.query.users.findFirst({ where: eq(users.id, recipientUid) });
        if (!recipient) throw new RequestError("That member could not be found.", 404);

        const [newMessage] = await db
          .insert(messages)
          .values({
            senderId: member.id,
            receiverId: recipientUid,
            content,
            attachment,
          })
          .returning();
        if (!newMessage) throw new Error("The message was not saved.");

        try {
          await db.insert(notifications).values({
            userId: recipientUid,
            type: "message",
            message: `New message from ${member.name || "a member"}`,
          });
        } catch (notificationError) {
          console.warn("[Faith In] Message saved without notification", notificationError);
        }
        return NextResponse.json({
          success: true,
          data: { thread_id: threadId || `thread-${recipientUid}`, message_id: newMessage.id },
        });
      }

      case "cv_social_mark_thread_read": {
        const member = requireSessionUser(session);
        const { recipientUid } = threadRecipient(payload);
        if (!recipientUid || recipientUid === member.id) {
          throw new RequestError("That conversation could not be found.", 400);
        }
        await db
          .update(messages)
          .set({ readAt: new Date() })
          .where(and(eq(messages.receiverId, member.id), eq(messages.senderId, recipientUid)));
        return NextResponse.json({ success: true, data: { ok: true } });
      }

      case "cv_social_set_thread_presence": {
        requireSessionUser(session);
        return NextResponse.json({ success: true, data: { ok: true } });
      }

      case "cv_social_search_message_users": {
        const member = requireSessionUser(session);
        const query =
          payloadText(payload, "q", MAX_SEARCH_LENGTH).toLowerCase() ||
          payloadText(payload, "query", MAX_SEARCH_LENGTH).toLowerCase();
        const dbUsers = await db.query.users.findMany({
          where: query ? ilike(users.name, `%${query}%`) : undefined,
          limit: 20,
        });
        const filteredUsers = dbUsers.filter((user) => user.id !== member.id);
        const items = await Promise.all(
          filteredUsers.map(async (user) => {
            const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });
            return {
              uid: user.id,
              name: user.name || "Faith In Member",
              role: profile?.headline || user.role || "Member",
              church: profile?.location || "",
              avatar: user.image,
            };
          }),
        );
        return NextResponse.json({ success: true, data: { items } });
      }

      default:
        return jsonError("This action is handled by the Firebase data backend.", 501);
    }
  } catch (error) {
    if (error instanceof RequestError) return jsonError(error.message, error.status);
    console.error(`[Faith In] Compat action failed: ${action}`, error);
    return jsonError("Faith In could not complete that request. Please try again.", 500);
  }
}
