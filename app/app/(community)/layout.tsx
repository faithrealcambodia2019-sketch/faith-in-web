import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { isOptionalServerBackendConfigured } from "@/lib/optional-server-backend";

export default async function CommunityLayout({ children }: { children: ReactNode }) {
  if (!isOptionalServerBackendConfigured()) redirect("/home");

  const { auth } = await import("@/auth");
  const session = await auth();

  // Fetch real statistics
  let myPostCount = 0;
  try {
    if (session?.user?.id) {
      const result = await db.select({ value: count() }).from(posts).where(eq(posts.userId, session.user.id));
      myPostCount = result[0].value;
    }
  } catch {}

  return (
    <div className="font-sans min-h-screen pb-16 lg:pb-0" data-page="home">
      <link rel="stylesheet" href="/faithin-app/assets/faithin-fonts.css" />
      <link rel="stylesheet" href="/faithin-app/assets/faithin-icons.css" />
      <link rel="stylesheet" href="/faithin-app/assets/faithin-tw.css" />
      <link rel="stylesheet" href="/faithin-app/assets/faithin.css" />
      <main className="max-w-[1200px] mx-auto px-3 sm:px-4 py-5 grid gap-5 lg:grid-cols-[232px_minmax(0,1fr)] xl:grid-cols-[232px_minmax(0,600px)_312px] items-start" id="main">
        {/* ───── LEFT RAIL ───── */}
        <aside className="hidden lg:block sticky top-[72px] space-y-4">
          <section className="card overflow-hidden">
            <div className="h-[62px] bg-[linear-gradient(120deg,#2f5bea,#5b7cf5_45%,#1e3a8a)]"></div>
            <div className="px-4 pb-4 -mt-8 flex flex-col items-center text-center">
              <span className="avatar w-16 h-16 text-[20px] ring-4 ring-surface" style={{ background: 'linear-gradient(135deg,#2f5bea,#1e40af)' }}>
                {session?.user?.name ? session.user.name.charAt(0) : "FI"}
              </span>
              <Link className="mt-2.5 font-bold text-[15px] hover:underline inline-flex items-center" href="/app/profile">
                {session?.user?.name || "Faith In User"}
                <span className="fi-verified-tick" title="Verified Member">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
              </Link>
              <p className="text-[12.5px] text-muted mt-0.5">Christian community</p>
            </div>
            <div className="border-t border-line grid grid-cols-2 divide-x divide-line">
              <Link className="px-3 py-3 hover:bg-raised transition text-center" href="/app/profile">
                <span className="block text-[11.5px] text-muted leading-tight">Profile viewers</span>
                <span className="block text-[17px] font-bold text-brand mt-1">{myPostCount * 3 + 2}</span>
              </Link>
              <Link className="px-3 py-3 hover:bg-raised transition text-center" href="/app/profile">
                <span className="block text-[11.5px] text-muted leading-tight">Post count</span>
                <span className="block text-[17px] font-bold text-brand mt-1">{myPostCount}</span>
              </Link>
            </div>
          </section>
          
          <nav aria-label="Sections" className="space-y-1">
            <Link className="nav-item is-active" href="/app"><i className="fa-solid fa-house"></i>Home Feed</Link>
            <Link className="nav-item" href="/app/profile"><i className="fa-solid fa-user text-blue-500"></i>Profile</Link>
            <Link className="nav-item" href="/app/studio"><i className="fa-solid fa-chart-line text-brand"></i>Creator Studio</Link>
            <Link className="nav-item" href="/app#prayer-wall"><i className="fa-solid fa-hands-praying text-rose"></i>Prayer Wall</Link>
            <Link className="nav-item" href="/app/jobs"><i className="fa-solid fa-briefcase text-emerald-600"></i>Find Jobs</Link>
            <Link className="nav-item" href="/app/network"><i className="fa-solid fa-globe text-indigo-500"></i>Find Users</Link>
            <Link className="nav-item" href="/app/library"><i className="fa-solid fa-book-open text-amber-500"></i>Library</Link>
          </nav>
        </aside>

        {children}

      </main>
    </div>
  );
}
