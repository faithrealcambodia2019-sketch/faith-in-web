import { ImageResponse } from "next/og";
import { site } from "@/lib/site-content";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "radial-gradient(circle at 70% 30%, #1A2230 0%, #0D1017 100%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "linear-gradient(135deg, #EBB94F, #D9941E)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 800,
                color: "#0D1017",
              }}
            >
              F
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                fontSize: 36,
                fontWeight: 900,
                letterSpacing: "-0.03em",
              }}
            >
              Faith<span style={{ color: "#D9941E" }}>In</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 999,
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: 18,
              fontWeight: 700,
              color: "#EBB94F",
            }}
          >
            Bilingual • ខ្មែរ / EN
          </div>
        </div>

        {/* Headline & Mission */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px" }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
            }}
          >
            Discover hope, purpose and faith for your journey.
          </div>

          <div
            style={{
              fontSize: 24,
              color: "#CBD5E1",
              lineHeight: 1.5,
            }}
          >
            Bilingual Khmer–English Bible study, spoken audio devotionals, and global prayer fellowship.
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "24px",
            fontSize: 18,
            color: "#94A3B8",
          }}
        >
          <div style={{ display: "flex", gap: "24px" }}>
            <span>100% Free Forever</span>
            <span>No Ads or Tracking</span>
            <span>Global Diaspora Community</span>
          </div>
          <div style={{ color: "#EBB94F", fontWeight: 700 }}>faithin.co</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
