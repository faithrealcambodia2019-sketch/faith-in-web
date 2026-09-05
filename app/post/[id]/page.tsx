import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site-content";

/**
 * Public permalink for a post, so a link pasted into Facebook, X, Telegram or
 * WhatsApp shows the post's own picture rather than the generic site card.
 *
 * The preview data rides in the query string rather than being fetched here,
 * and that is deliberate: a social crawler is anonymous, Firestore requires a
 * verified member to read a post, and this deployment holds no Firebase
 * service account by design (see lib/verify-firebase-token.ts). There is no
 * way for the server to look the post up. The sharer's own browser already
 * has the media URL, so it puts it in the link it shares.
 *
 * The obvious hazard in that trade is someone hand-writing a link with any
 * image they like and letting it circulate under FaithIn's name. Restricting
 * the media host to FaithIn's own storage closes it: a crafted link can still
 * only ever surface media that is already hosted on FaithIn.
 */
const MEDIA_HOSTS = [/(^|\.)supabase\.co$/i, /(^|\.)blob\.vercel-storage\.com$/i];

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

/** A media URL, or "" — https only, and only from FaithIn's own storage. */
function safeMedia(value: string | string[] | undefined): string {
  const raw = first(value).trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return "";
    return MEDIA_HOSTS.some((host) => host.test(url.hostname)) ? url.toString() : "";
  } catch {
    return "";
  }
}

/** Trim to something that reads as a caption rather than a wall of text. */
function caption(value: string | string[] | undefined, limit = 200): string {
  const text = first(value).replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  const query = await searchParams;

  const image = safeMedia(query.i);
  const video = safeMedia(query.v);
  const text = caption(query.t);
  const author = caption(query.a, 60);

  const title = author ? `${author} on ${site.name}` : `A blessing on ${site.name}`;
  const description =
    text || "A blessing shared on Faith In — a bilingual Christian community for Khmer and English speakers.";
  const url = `${site.origin}/post/${encodeURIComponent(id)}`;
  const preview = image || `${site.origin}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: video ? "video.other" : "article",
      siteName: site.name,
      title,
      description,
      url,
      images: [{ url: preview }],
      ...(video ? { videos: [{ url: video, secureUrl: video, type: "video/mp4" }] } : {}),
    },
    twitter: {
      card: video || image ? "summary_large_image" : "summary",
      title,
      description,
      images: [preview],
    },
  };
}

export default async function SharedPostPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;

  const image = safeMedia(query.i);
  const video = safeMedia(query.v);
  const text = caption(query.t, 400);
  const author = caption(query.a, 60);
  const openInApp = `/home?post=${encodeURIComponent(id)}`;

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#050505] font-sans">
      <div className="max-w-[560px] mx-auto px-4 py-10">
        <div className="bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.2)] overflow-hidden">
          <div className="px-4 py-3">
            <p className="text-[15px] font-semibold">{author || "A Faith In member"}</p>
            <p className="text-[13px] text-[#65676B] mt-0.5">shared on {site.name}</p>
          </div>

          {text ? <p className="px-4 pb-3 text-[15px] leading-relaxed">{text}</p> : null}

          {video ? (
            <video className="w-full bg-black" controls playsInline preload="metadata" src={video} />
          ) : image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="w-full" src={image} alt="Shared on Faith In" />
          ) : null}

          <div className="px-4 py-3">
            <Link
              href={openInApp}
              className="inline-flex items-center justify-center w-full h-9 rounded-md bg-[#2F5BEA] text-white text-[15px] font-semibold hover:bg-[#2549C9] transition-colors"
            >
              Open in {site.name}
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-[13px] text-[#65676B]">
          Comments, prayers and the rest of the conversation live in the app.
        </p>
      </div>
    </div>
  );
}
