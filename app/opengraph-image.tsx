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
                display: "flex",
                alignItems: "baseline",
                fontSize: 44,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: "#5C81F2",
              }}
            >
              FaithIn
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "4px solid #5C81F2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 36,
                  borderRadius: "50%",
                  border: "3px solid #5C81F2",
                  display: "flex",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 17,
                  left: 0,
                  width: 36,
                  height: 3,
                  background: "#5C81F2",
                  display: "flex",
                }}
              />
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
              color: "#5C81F2",
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
            {["100% Free Forever", "No Ads or Tracking", "Global Diaspora Community"].map((label) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 7,
                    height: 12,
                    display: "flex",
                    borderRight: "2px solid #94A3B8",
                    borderBottom: "2px solid #94A3B8",
                    transform: "rotate(45deg)",
                  }}
                />
                {label}
              </span>
            ))}
          </div>
          <div style={{ color: "#5C81F2", fontWeight: 700 }}>faithin.co</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
