import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, profiles, users, prayers, jobs, resources, messages } from "@/lib/db/schema";
import { auth } from "@/auth";
import { desc, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();
  
  // Parse FormData or JSON
  let action = "";
  let payload: any = {};
  
  const contentType = req.headers.get("content-type") || "";
  
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    action = formData.get("action") as string;
    for (const [key, value] of formData.entries()) {
      payload[key] = value;
    }
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await req.formData();
    action = formData.get("action") as string;
    for (const [key, value] of formData.entries()) {
      payload[key] = value;
    }
  } else {
    try {
      const data = await req.json();
      action = data.action;
      payload = data;
    } catch (e) {}
  }
  
  console.log("Compat API received action:", action);

  if (!action) {
    return NextResponse.json({ success: false, data: "No action provided" });
  }
  
  try {
    switch (action) {
      case "cv_get_session":
        if (!session?.user) return NextResponse.json({ success: true, data: { is_logged_in: false } });
        // Fetch full profile
        const userProfile = await db.query.profiles.findFirst({
          where: eq(profiles.userId, session.user.id as string)
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
              role: "user"
            }
          }
        });

      case "cv_get_posts":
        const allPosts = await db.query.posts.findMany({
          orderBy: [desc(posts.createdAt)],
          limit: 20
        });
        return NextResponse.json({
          success: true,
          data: allPosts.map(p => ({
            id: p.id,
            author_uid: p.userId,
            author_name: "User", // Join with users in real query
            type: p.type,
            content: p.content,
            created_at: p.createdAt.toISOString()
          }))
        });

      case "cv_create_post":
        if (!session?.user?.id) throw new Error("Unauthorized");
        const newPost = await db.insert(posts).values({
          userId: session.user.id,
          content: payload.content || "",
          type: payload.type || "blessing",
        }).returning();
        return NextResponse.json({ success: true, data: newPost[0] });
        
      case "cv_get_prayers":
        const allPrayers = await db.query.prayers.findMany({
          orderBy: [desc(prayers.createdAt)],
          limit: 20
        });
        return NextResponse.json({
          success: true,
          data: allPrayers.map(p => ({
            id: p.id,
            author_uid: p.userId,
            title: p.title,
            content: p.content,
            category: p.category,
            is_anonymous: p.isAnonymous,
            created_at: p.createdAt.toISOString()
          }))
        });

      // --- Messaging Backend Actions ---
      case "cv_social_get_message_threads":
        return NextResponse.json({
          success: true,
          data: {
            items: [
              {
                id: "thread-sophea",
                other_user: { uid: "u-sophea", name: "Sophea Sok", role: "Worship Leader" },
                last_message: "Let me know so we can save a seat.",
                last_message_at: new Date(Date.now() - 3600000).toISOString(),
                unread_count: 2,
                presence: { active: true }
              },
              {
                id: "thread-dara",
                other_user: { uid: "u-dara", name: "Dara Chhan", role: "Youth Pastor" },
                last_message: "Yes, thank you! It was very helpful.",
                last_message_at: new Date(Date.now() - 86400000).toISOString(),
                unread_count: 0,
                presence: { active: false, last_active_at: new Date(Date.now() - 300000).toISOString() }
              },
              {
                id: "thread-ym",
                other_user: { uid: "u-ym", name: "Youth Ministry Team", role: "Ministry Group" },
                last_message: "Meeting at 5 PM this Friday.",
                last_message_at: new Date(Date.now() - 172800000).toISOString(),
                unread_count: 0,
                presence: { active: false }
              }
            ]
          }
        });

      case "cv_social_open_thread":
        const threadId = payload.thread_id || (payload.recipient_uid ? `thread-${payload.recipient_uid}` : "thread-dara");
        let otherUser = { uid: "u-dara", name: "Dara Chhan", role: "Youth Pastor" };
        if (threadId.includes("sophea") || payload.recipient_uid === "u-sophea") {
          otherUser = { uid: "u-sophea", name: "Sophea Sok", role: "Worship Leader" };
        } else if (threadId.includes("ym") || payload.recipient_uid === "u-ym") {
          otherUser = { uid: "u-ym", name: "Youth Ministry Team", role: "Ministry Group" };
        }
        return NextResponse.json({
          success: true,
          data: {
            thread_id: threadId,
            exists: true,
            other_user: otherUser
          }
        });

      case "cv_social_get_message_thread":
        return NextResponse.json({
          success: true,
          data: {
            thread_id: payload.thread_id,
            items: [
              {
                id: "msg-1",
                mine: true,
                body: "Here is the PDF we discussed.",
                created_at: new Date(Date.now() - 86400000).toISOString(),
                attachment: { name: "Youth_Ministry_Guide.pdf", size: "2.4 MB", type: "application/pdf" }
              },
              {
                id: "msg-2",
                mine: false,
                body: "Yes, thank you! It was very helpful.",
                created_at: new Date(Date.now() - 82000000).toISOString()
              }
            ]
          }
        });

      case "cv_social_send_message":
        if (session?.user?.id && payload.recipient_uid) {
          try {
            await db.insert(messages).values({
              senderId: session.user.id,
              receiverId: payload.recipient_uid,
              content: payload.body || "",
              attachment: payload.attachment || null
            });
          } catch (e) {}
        }
        return NextResponse.json({
          success: true,
          data: {
            thread_id: payload.thread_id || "thread-active",
            message_id: `msg-${Date.now()}`
          }
        });

      case "cv_social_mark_thread_read":
        return NextResponse.json({ success: true, data: { ok: true } });

      case "cv_social_set_thread_presence":
        return NextResponse.json({ success: true, data: { ok: true } });

      case "cv_social_search_message_users":
        const allUsers = await db.query.users.findMany({ limit: 10 });
        const userItems = allUsers.map(u => ({
          uid: u.id,
          name: u.name || "Faith In Member",
          role: u.role || "Member",
          church: "Faith Community",
          avatar: u.image
        }));
        if (!userItems.length) {
          userItems.push(
            { uid: "u-sophea", name: "Sophea Sok", role: "Worship Leader", church: "Phnom Penh Grace", avatar: null },
            { uid: "u-dara", name: "Dara Chhan", role: "Youth Pastor", church: "Faith Community", avatar: null },
            { uid: "u-kosal", name: "Kosal Meng", role: "Bible Teacher", church: "Siem Reap Hope", avatar: null },
            { uid: "u-bopha", name: "Bopha Vong", role: "Choir Director", church: "Battambang Fellowship", avatar: null }
          );
        }
        return NextResponse.json({
          success: true,
          data: { items: userItems }
        });

      default:
        console.warn("Unimplemented action:", action);
        return NextResponse.json({ success: true, data: [] });
    }
  } catch (err: any) {
    console.error("Compat API Error:", err);
    return NextResponse.json({ success: false, data: err.message });
  }
}
