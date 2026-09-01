import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, profiles, users, prayers, jobs, resources, messages, notifications } from "@/lib/db/schema";
import { auth } from "@/auth";
import { desc, asc, eq, or, and, ilike } from "drizzle-orm";

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

      // --- Messaging Backend Actions with Full Database Integration ---
      case "cv_social_get_message_threads": {
        const myUid = session?.user?.id;
        let realThreads: any[] = [];

        if (myUid) {
          try {
            // Find all messages involving current user
            const myMessages = await db.query.messages.findMany({
              where: or(eq(messages.senderId, myUid), eq(messages.receiverId, myUid)),
              orderBy: [desc(messages.createdAt)],
              limit: 100,
            });

            // Group by contact user id
            const contactMap = new Map<string, typeof myMessages[0][]>();
            for (const msg of myMessages) {
              const otherId = msg.senderId === myUid ? msg.receiverId : msg.senderId;
              if (!contactMap.has(otherId)) {
                contactMap.set(otherId, []);
              }
              contactMap.get(otherId)!.push(msg);
            }

            // Fetch user info for contacts
            for (const [otherId, threadMsgs] of contactMap.entries()) {
              const otherUser = await db.query.users.findFirst({
                where: eq(users.id, otherId),
              });
              const otherProfile = await db.query.profiles.findFirst({
                where: eq(profiles.userId, otherId),
              });

              const lastMsg = threadMsgs[0];
              const unreadCount = threadMsgs.filter(
                (m) => m.receiverId === myUid && !m.readAt
              ).length;

              realThreads.push({
                id: `thread-${otherId}`,
                other_user: {
                  uid: otherId,
                  name: otherUser?.name || "Faith In Member",
                  role: otherProfile?.headline || otherUser?.role || "Member",
                  avatar: otherUser?.image,
                },
                last_message: lastMsg?.content || "Sent an attachment",
                last_message_at: lastMsg?.createdAt.toISOString(),
                unread_count: unreadCount,
                presence: { active: true },
              });
            }
          } catch (err) {
            console.error("Error querying db message threads:", err);
          }
        }

        // Seed / fallback initial realistic contacts if no DB threads exist yet
        if (!realThreads.length) {
          realThreads = [
            {
              id: "mock-1",
              other_user: { uid: "u-sophea", name: "Sophea Sok", role: "Worship Leader", church: "Phnom Penh Grace Church" },
              last_message: "Let me know so we can save a seat.",
              last_message_at: new Date(Date.now() - 3600000).toISOString(),
              unread_count: 2,
              presence: { active: true }
            },
            {
              id: "mock-2",
              other_user: { uid: "u-dara", name: "Dara Chhan", role: "Youth Pastor", church: "Faith Community Church" },
              last_message: "Yes, thank you! It was very helpful.",
              last_message_at: new Date(Date.now() - 86400000).toISOString(),
              unread_count: 0,
              presence: { active: false, last_active_at: new Date(Date.now() - 300000).toISOString() }
            },
            {
              id: "mock-3",
              other_user: { uid: "u-ym", name: "Youth Ministry Team", role: "Ministry Group", church: "Faith In Network" },
              last_message: "Meeting at 5 PM this Friday.",
              last_message_at: new Date(Date.now() - 172800000).toISOString(),
              unread_count: 0,
              presence: { active: false }
            }
          ];
        }

        return NextResponse.json({
          success: true,
          data: { items: realThreads }
        });
      }

      case "cv_social_open_thread": {
        const threadId = payload.thread_id || (payload.recipient_uid ? `thread-${payload.recipient_uid}` : "mock-2");
        const recipientUid = payload.recipient_uid || threadId.replace(/^thread-/, "");

        let otherUser = { uid: recipientUid, name: "Dara Chhan", role: "Youth Pastor", avatar: null as string | null };

        if (recipientUid && !recipientUid.startsWith("mock-")) {
          try {
            const dbUser = await db.query.users.findFirst({ where: eq(users.id, recipientUid) });
            if (dbUser) {
              const dbProfile = await db.query.profiles.findFirst({ where: eq(profiles.userId, recipientUid) });
              otherUser = {
                uid: dbUser.id,
                name: dbUser.name || "Faith In Member",
                role: dbProfile?.headline || dbUser.role || "Member",
                avatar: dbUser.image,
              };
            }
          } catch (e) {}
        } else if (threadId.includes("sophea") || recipientUid === "u-sophea") {
          otherUser = { uid: "u-sophea", name: "Sophea Sok", role: "Worship Leader", avatar: null };
        } else if (threadId.includes("ym") || recipientUid === "u-ym") {
          otherUser = { uid: "u-ym", name: "Youth Ministry Team", role: "Ministry Group", avatar: null };
        }

        return NextResponse.json({
          success: true,
          data: {
            thread_id: threadId,
            exists: true,
            other_user: otherUser
          }
        });
      }

      case "cv_social_get_message_thread": {
        const myUid = session?.user?.id;
        const threadId = payload.thread_id || "";
        const recipientUid = payload.recipient_uid || threadId.replace(/^thread-/, "");

        if (myUid && recipientUid && !recipientUid.startsWith("mock-")) {
          try {
            const dbMsgs = await db.query.messages.findMany({
              where: or(
                and(eq(messages.senderId, myUid), eq(messages.receiverId, recipientUid)),
                and(eq(messages.senderId, recipientUid), eq(messages.receiverId, myUid))
              ),
              orderBy: [asc(messages.createdAt)],
              limit: 100,
            });

            if (dbMsgs.length > 0) {
              return NextResponse.json({
                success: true,
                data: {
                  thread_id: threadId,
                  items: dbMsgs.map((m) => {
                    let attachmentObj = null;
                    if (m.attachment) {
                      try {
                        attachmentObj = JSON.parse(m.attachment);
                      } catch {
                        attachmentObj = { name: "Attachment", url: m.attachment };
                      }
                    }
                    return {
                      id: m.id,
                      mine: m.senderId === myUid,
                      body: m.content,
                      attachment: attachmentObj,
                      created_at: m.createdAt.toISOString(),
                    };
                  }),
                },
              });
            }
          } catch (err) {
            console.error("Error querying db messages:", err);
          }
        }

        // Return default mock thread data
        if (threadId === "mock-1" || threadId.includes("sophea")) {
          return NextResponse.json({
            success: true,
            data: {
              thread_id: threadId,
              items: [
                { id: "m-1-1", mine: false, body: "Hello! Are you going to the service tomorrow?", created_at: new Date(Date.now() - 3600000).toISOString() },
                { id: "m-1-2", mine: false, body: "Let me know so we can save a seat.", created_at: new Date(Date.now() - 3500000).toISOString() }
              ]
            }
          });
        }

        if (threadId === "mock-3" || threadId.includes("ym")) {
          return NextResponse.json({
            success: true,
            data: {
              thread_id: threadId,
              items: [
                { id: "m-3-1", mine: false, body: "Meeting at 5 PM this Friday.", created_at: new Date(Date.now() - 172800000).toISOString() }
              ]
            }
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            thread_id: threadId,
            items: [
              {
                id: "m-2-1",
                mine: true,
                body: "Here is the PDF we discussed.",
                created_at: new Date(Date.now() - 86400000).toISOString(),
                attachment: { name: "Youth_Ministry_Guide.pdf", size: "2.4 MB", type: "application/pdf" }
              },
              {
                id: "m-2-2",
                mine: false,
                body: "Yes, thank you! It was very helpful.",
                created_at: new Date(Date.now() - 82000000).toISOString()
              }
            ]
          }
        });
      }

      case "cv_social_send_message": {
        const myUid = session?.user?.id;
        const threadId = payload.thread_id || "";
        const recipientUid = payload.recipient_uid || threadId.replace(/^thread-/, "");
        const content = payload.body || payload.content || "";
        const attachment = payload.attachment || null;

        let insertedId = `msg-${Date.now()}`;

        if (myUid && recipientUid && !recipientUid.startsWith("mock-")) {
          try {
            const [newMsg] = await db.insert(messages).values({
              senderId: myUid,
              receiverId: recipientUid,
              content: content,
              attachment: typeof attachment === "object" ? JSON.stringify(attachment) : (attachment || null),
            }).returning();

            if (newMsg) insertedId = newMsg.id;

            // Notify recipient
            await db.insert(notifications).values({
              userId: recipientUid,
              type: "message",
              message: `New message from ${session.user?.name || "a member"}`,
            }).catch(() => {});
          } catch (err) {
            console.error("Error inserting message to db:", err);
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            thread_id: threadId,
            message_id: insertedId,
          }
        });
      }

      case "cv_social_mark_thread_read": {
        const myUid = session?.user?.id;
        const threadId = payload.thread_id || "";
        const recipientUid = payload.recipient_uid || threadId.replace(/^thread-/, "");
        if (myUid && recipientUid) {
          try {
            await db.update(messages)
              .set({ readAt: new Date() })
              .where(and(eq(messages.receiverId, myUid), eq(messages.senderId, recipientUid)));
          } catch (e) {}
        }
        return NextResponse.json({ success: true, data: { ok: true } });
      }

      case "cv_social_set_thread_presence":
        return NextResponse.json({ success: true, data: { ok: true } });

      case "cv_social_search_message_users": {
        const query = (payload.q || payload.query || "").toString().trim().toLowerCase();
        let userItems: any[] = [];

        try {
          const dbUsers = await db.query.users.findMany({
            where: query ? ilike(users.name, `%${query}%`) : undefined,
            limit: 20,
          });

          for (const u of dbUsers) {
            const profile = await db.query.profiles.findFirst({
              where: eq(profiles.userId, u.id),
            });
            userItems.push({
              uid: u.id,
              name: u.name || "Faith In Member",
              role: profile?.headline || u.role || "Member",
              church: profile?.location || "Faith Community Church",
              avatar: u.image,
            });
          }
        } catch (err) {
          console.error("Error searching users in db:", err);
        }

        // Add built-in community leaders if matching query
        const defaults = [
          { uid: "u-sophea", name: "Sophea Sok", role: "Worship Leader", church: "Phnom Penh Grace Church", avatar: null },
          { uid: "u-dara", name: "Dara Chhan", role: "Youth Pastor", church: "Faith Community Church", avatar: null },
          { uid: "u-kosal", name: "Kosal Meng", role: "Bible Teacher", church: "Siem Reap Hope Fellowship", avatar: null },
          { uid: "u-bopha", name: "Bopha Vong", role: "Choir Director", church: "Battambang Fellowship", avatar: null }
        ];

        defaults.forEach(d => {
          if (!query || d.name.toLowerCase().includes(query) || d.role.toLowerCase().includes(query)) {
            if (!userItems.some(u => u.uid === d.uid || u.name === d.name)) {
              userItems.push(d);
            }
          }
        });

        return NextResponse.json({
          success: true,
          data: { items: userItems }
        });
      }

      default:
        console.warn("Unimplemented action:", action);
        return NextResponse.json({ success: true, data: [] });
    }
  } catch (err: any) {
    console.error("Compat API Error:", err);
    return NextResponse.json({ success: false, data: err.message });
  }
}
