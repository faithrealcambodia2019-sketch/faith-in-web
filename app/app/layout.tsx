import type { Metadata } from "next";
import { site } from "@/lib/site-content";

export const metadata: Metadata = {
  title: `Open ${site.name}`,
  description: `Sign in to ${site.name} to read the Khmer Bible, share posts and blessings, request prayer, and browse ministry resources.`,
  alternates: { canonical: "/app" },
  robots: { index: false, follow: true },
};

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
