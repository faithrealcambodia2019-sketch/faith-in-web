import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isOptionalServerBackendConfigured } from "@/lib/optional-server-backend";

// Server action to create post
async function createPost(formData: FormData) {
  "use server";
  if (!isOptionalServerBackendConfigured()) {
    throw new Error("Optional server backend is unavailable");
  }

  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const contentValue = formData.get("content");
  const content = typeof contentValue === "string" ? contentValue.trim() : "";
  const typeValue = formData.get("type");
  const type =
    typeValue === "testimony" || typeValue === "article" ? typeValue : "blessing";

  if (!content || content.length > 5_000) return;

  await db.insert(posts).values({
    userId: session.user.id,
    content,
    type,
  });

  revalidatePath("/app");
}

void createPost;

export default async function FeedPage() {
  if (!isOptionalServerBackendConfigured()) redirect("/home");

  const { auth } = await import("@/auth");
  const session = await auth();

  // Fetch posts from database
  let feedPosts: Array<typeof posts.$inferSelect> = [];
  try {
    feedPosts = await db.query.posts.findMany({
      orderBy: [desc(posts.createdAt)],
      limit: 20,
    });
  } catch (e) {
    console.error("Failed to load posts", e);
  }

  return (
    <>
      {/* ───── CENTER ───── */}
      <section className="space-y-4 min-w-0" id="feed">
        {/* composer */}
        <section className="card p-3.5">
          <div className="flex items-center gap-3">
            <span className="avatar w-11 h-11 text-[14px]" style={{ background: 'linear-gradient(135deg,#2f5bea,#1e40af)' }}>
              {session?.user?.name ? session.user.name.charAt(0) : "FI"}
            </span>
            <button className="flex-1 text-left rounded-pill bg-raised hover:bg-line/60 border border-line px-4 py-2.5 text-[14px] text-muted transition">
              Share a blessing, testimony, or encouragement…
            </button>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-line flex items-center gap-1">
            <button className="action-btn !text-[12.5px] sm:!text-[14px]"><i className="fa-solid fa-hands-praying text-brand"></i>Blessing</button>
            <button className="action-btn !text-[12.5px] sm:!text-[14px]"><i className="fa-regular fa-image text-emerald-500"></i>Photo</button>
            <button className="action-btn !text-[12.5px] sm:!text-[14px]"><i className="fa-solid fa-video text-rose"></i>Video</button>
            <button className="action-btn !text-[12.5px] sm:!text-[14px]"><i className="fa-regular fa-heart text-rose"></i>Prayer</button>
            <button className="action-btn !text-[12.5px] sm:!text-[14px]"><i className="fa-regular fa-file-lines text-violet-500"></i>Article</button>
          </div>
        </section>

        {/* sort */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-line"></div>
          <div className="relative">
            <button className="flex items-center gap-1.5 text-[12.5px] text-muted hover:text-ink transition">
              Sort by <span className="font-semibold text-ink">Top</span><i className="fa-solid fa-chevron-down text-[9px]"></i>
            </button>
          </div>
        </div>

        {/* posts */}
        <div className="space-y-4" id="posts">
          {feedPosts.length === 0 ? (
            <div className="card p-8 text-center text-muted">
              <i className="fa-solid fa-seedling text-3xl mb-3 text-emerald-500"></i>
              <p>No posts yet. Be the first to share a blessing!</p>
            </div>
          ) : (
            feedPosts.map((post) => (
              <article key={post.id} className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="avatar w-10 h-10 text-[13px] bg-brand text-white">U</span>
                  <div>
                    <h3 className="font-bold text-[14.5px]">User</h3>
                    <p className="text-[12px] text-muted">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-[15px] leading-relaxed text-ink/90">{post.content}</p>
                
                <div className="mt-4 pt-3 border-t border-line flex items-center gap-4 text-muted text-[13px]">
                  <button className="flex items-center gap-1.5 hover:text-brand transition"><i className="fa-regular fa-heart"></i> Amen</button>
                  <button className="flex items-center gap-1.5 hover:text-brand transition"><i className="fa-regular fa-comment"></i> Comment</button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* ───── RIGHT RAIL ───── */}
      <aside className="hidden xl:block sticky top-[72px] space-y-4">
        <section className="card overflow-hidden">
          <div className="px-4 pt-4 flex items-center justify-between">
            <h2 className="font-serif font-semibold text-[15px]">Verse of the Day</h2>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-gold bg-gold/10 px-2 py-1 rounded-full">Daily</span>
          </div>
          <blockquote className="px-4 py-3.5 mt-2 border-l-[3px] border-gold ml-4 space-y-3">
            <p className="font-khmer text-[13.5px] leading-[1.9] text-ink/90">
              «ដ្បិតព្រះទ្រង់ស្រឡាញ់មនុស្សលោក ដល់ម៉្លេះបានជាទ្រង់ប្រទានព្រះរាជបុត្រាទ្រង់តែ១ ដើម្បីឲ្យអ្នកណាដែលជឿដល់ព្រះរាជបុត្រានោះ មិនត្រូវវិនាសឡើយ គឺឲ្យមានជីវិតអស់កល្បជានិច្ចវិញ»
            </p>
            <p className="font-serif italic text-[14px] leading-relaxed text-ink">
              &ldquo;For God so loved the world, that he gave his only begotten Son.&rdquo;
            </p>
          </blockquote>
          <div className="px-4 pb-3 text-right text-[11px] font-bold uppercase tracking-wide text-muted">យ៉ូហាន ៣:១៦ · John 3:16</div>
        </section>

        <section className="card p-5 rounded-[24px]">
          <h2 className="font-bold text-[18px] text-ink tracking-tight mb-4">Contacts</h2>
          <div className="text-center text-muted text-[13px]">
            <p>Connect with others to see contacts here.</p>
            <Link href="/app/network" className="block w-full mt-3 py-2 font-semibold text-brand hover:bg-raised rounded-lg transition">
              Find Users
            </Link>
          </div>
        </section>

        <section className="card p-4" id="prayer-wall">
          <h2 className="font-semibold text-[15px] mb-1">Prayer Wall</h2>
          <p className="text-[12.5px] text-muted mb-3">Requests from the community.</p>
          <div className="space-y-2.5">
            <p className="p-6 text-center text-[13.5px] text-muted">No prayer requests today.</p>
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
