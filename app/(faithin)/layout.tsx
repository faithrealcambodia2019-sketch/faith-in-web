import type { Metadata } from "next";
import "./faithin-ui.css";

export const metadata: Metadata = {
  title: "Faith In",
  description: "Read Scripture, share blessings and pray with the Faith In community.",
  // Signed-in surfaces have no indexable content.
  robots: { index: false, follow: true },
};

export default function FaithInLayout({ children }: { children: React.ReactNode }) {
  return <div className="fi-root font-sans">{children}</div>;
}
