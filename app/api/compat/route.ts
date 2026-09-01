import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, profiles, users, prayers, jobs, resources } from "@/lib/db/schema";
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
        
      // Mock other endpoints for now
      default:
        console.warn("Unimplemented action:", action);
        return NextResponse.json({ success: true, data: [] });
    }
  } catch (err: any) {
    console.error("Compat API Error:", err);
    return NextResponse.json({ success: false, data: err.message });
  }
}
