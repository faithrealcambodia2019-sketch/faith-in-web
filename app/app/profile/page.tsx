import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import ProfileClient from "./ProfileClient";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isOptionalServerBackendConfigured } from "@/lib/optional-server-backend";

export default async function ProfilePage() {
  if (!isOptionalServerBackendConfigured()) redirect("/home");

  const { auth } = await import("@/auth");
  const session = await auth();
  
  let myPostCount = 0;
  try {
    if (session?.user?.id) {
      const result = await db.select({ value: count() }).from(posts).where(eq(posts.userId, session.user.id));
      myPostCount = result[0].value;
    }
  } catch {}

  return (
    <>
      <ProfileClient user={session?.user} postCount={myPostCount} />

      {/* ───── RIGHT RAIL ───── */}
      <aside className="hidden xl:block sticky top-[72px] space-y-4">
        <section className="card p-5 rounded-[24px]">
          <h2 className="font-bold text-[18px] text-ink tracking-tight mb-4">Contacts</h2>
          <div className="text-center text-muted text-[13px]">
            <p>Connect with others to see contacts here.</p>
            <Link href="/app/network" className="block w-full mt-3 py-2 font-semibold text-brand hover:bg-raised rounded-lg transition">
              Find Users
            </Link>
          </div>
        </section>

        <footer className="px-2 pb-4 text-center space-y-2">
          <p className="text-[11.5px] text-muted leading-relaxed">
            <Link className="hover:text-brand hover:underline" href="/about">About</Link> ·
            <Link className="hover:text-brand hover:underline" href="/contact">Help Center</Link> ·
            <Link className="hover:text-brand hover:underline" href="/privacy">Privacy</Link> · 
            <Link className="hover:text-brand hover:underline" href="/terms">Terms</Link>
          </p>
          <p className="text-[11.5px] text-faint">Faith In Corporation © 2026</p>
        </footer>
      </aside>
    </>
  );
}
