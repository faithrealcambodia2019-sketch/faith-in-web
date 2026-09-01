import type { Metadata, Viewport } from "next";
import { Inter, Koh_Santepheap } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/runtime-config";
import { site } from "@/lib/site-content";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const kohSantepheap = Koh_Santepheap({
  subsets: ["khmer", "latin"],
  variable: "--font-koh-santepheap",
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.origin }],
  creator: site.name,
  publisher: site.legalName,
  keywords: [
    "Faith In",
    "Khmer Bible",
    "Khmer Christian",
    "ព្រះគម្ពីរ",
    "ព្រះគម្ពីរបរិសុទ្ធ",
    "Christian Community Cambodia",
    "Bilingual Bible study",
    "Prayer wall",
    "Audio blessings",
    "Cambodian diaspora church",
  ],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["km_KH"],
    url: site.origin,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.shortDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.shortDescription,
  },
  icons: {
    icon: [
      { url: "/assets/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/images/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/assets/images/favicon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: site.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#D9941E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${kohSantepheap.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-[#FCFCFA] text-[#0D1017]">
        {children}
      </body>
    </html>
  );
}
