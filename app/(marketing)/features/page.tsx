import type { Metadata } from "next";
import Link from "next/link";
import { site, features } from "@/lib/site-content";
import { ContactsWidget } from "@/components/ContactsWidget";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Globe,
  Activity,
  Layers,
  AudioLines,
  Compass,
} from "lucide-react";

export const metadata: Metadata = {
  title: `Features — ${site.name}`,
  description:
    "Explore all Faith In features: bilingual Khmer–English Bible study, spoken audio devotionals, global prayer sanctuary, scripture card designer, and Christian ministry jobs.",
};

export default function FeaturesPage() {
  return (
    <div className="fi-page">
      {/* Header / Hero */}
      <section className="fi-hero pb-12">
        <div className="fi-shell text-center max-w-3xl mx-auto space-y-4">
          <span className="fi-eyebrow">Platform Capabilities • មុខងារទាំងអស់</span>
          <h1 className="text-4xl sm:text-5xl font-black text-charcoal-900 tracking-tight leading-tight">
            Every tool designed for your <span className="fi-hero-highlight">spiritual walk.</span>
          </h1>
          <p className="text-lg text-charcoal-600 leading-relaxed">
            From side-by-side Khmer and English Scripture study to peaceful spoken blessings and a global prayer sanctuary, explore how Faith In supports your daily walk with Christ.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link href={site.appPath} className="fi-btn fi-btn--primary">
              <span>Try All Features in App</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/bible-study" className="fi-btn fi-btn--secondary">
              <span>View Bible Studio</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="fi-section fi-section--subtle">
        <div className="fi-shell">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.slug}
                className="fi-card flex flex-col justify-between space-y-6 hover:border-[#2F5BEA]/50 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#E9EFFE] border border-[#C9D8FC] text-[#1E40AF] flex items-center justify-center shadow-xs">
                      {f.icon === "sparkles" && <Sparkles className="w-6 h-6" />}
                      {f.icon === "globe" && <Globe className="w-6 h-6" />}
                      {f.icon === "activity" && <Activity className="w-6 h-6" />}
                      {f.icon === "audio-lines" && <AudioLines className="w-6 h-6" />}
                      {f.icon === "layers" && <Layers className="w-6 h-6" />}
                      {f.icon === "compass" && <Compass className="w-6 h-6" />}
                    </div>

                    {f.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E9EFFE] text-[#1E40AF] border border-[#C9D8FC]">
                        {f.badge}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {f.khmerTitle && (
                      <div className="text-xs font-khmer font-bold text-[#1E40AF]">
                        {f.khmerTitle}
                      </div>
                    )}
                    <h3 className="text-xl font-extrabold text-charcoal-900">
                      {f.title}
                    </h3>
                  </div>

                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    {f.detail}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#EAE7DC]/60 flex items-center justify-between text-xs font-bold">
                  <span className="text-charcoal-500 uppercase tracking-wider">
                    {f.category}
                  </span>
                  <Link
                    href={f.slug === "bible-study" ? "/bible-study" : site.appPath}
                    className="inline-flex items-center gap-1 text-[#1E40AF] hover:underline"
                  >
                    <span>Open {f.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive FaithIn Contacts & Fellowship Showcase */}
      <section className="fi-section">
        <div className="fi-shell">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="fi-eyebrow">Fellowship &amp; Connections • ការប្រកបគ្នា</span>
              <h2 className="text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight leading-tight">
                Connect with believers and ministries on <span className="fi-hero-highlight">Faithin.</span>
              </h2>
              <p className="text-base sm:text-lg text-charcoal-600 leading-relaxed">
                Stay updated with ministry friends, discover community leaders, and initiate encouraging conversations with our streamlined FaithIn Contacts network.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E9EFFE] text-[#1E40AF] flex items-center justify-center font-bold text-sm">✓</div>
                  <span className="text-sm font-semibold text-charcoal-800">Direct 1-to-1 messaging with custom FaithIn chat</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E9EFFE] text-[#2F5BEA] flex items-center justify-center font-bold text-sm">✓</div>
                  <span className="text-sm font-semibold text-charcoal-800">Follow Bible channels, pastors, and Christian friends</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-bold text-sm">✓</div>
                  <span className="text-sm font-semibold text-charcoal-800">Privacy-preserving community with instant search</span>
                </div>
              </div>
              <div className="pt-2">
                <Link href={site.appPath} className="fi-btn fi-btn--primary">
                  <span>Open Community Network</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <ContactsWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Modern Technology Comparison */}
      <section className="fi-section fi-section--subtle">
        <div className="fi-shell">
          <div className="fi-head">
            <span className="fi-eyebrow">The Difference • ភាពខុសប្លែក</span>
            <h2>Built differently from the ground up</h2>
            <p>
              Traditional social media is loud and commercialized. Faith In is intentionally built as a serene, focused sanctuary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="fi-card p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-charcoal-900">
                100% Ad-Free Sanctuary
              </h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                No third-party trackers, no behavioral ads, and no selling your personal spiritual journey to marketers.
              </p>
            </div>

            <div className="fi-card p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-charcoal-900">
                True Bilingual Engine
              </h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Tailored font rendering engine designed specifically for Khmer script ligatures, line heights, and dual-language reading.
              </p>
            </div>

            <div className="fi-card p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-charcoal-900">
                Ultra-Fast &amp; Mobile First
              </h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Loads instantaneously on 3G, 4G, 5G, and slow mobile connections across Cambodia, North America, Europe, and Asia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="fi-section fi-section--subtle">
        <div className="fi-shell">
          <div className="fi-cta-banner">
            <div className="max-w-2xl mx-auto space-y-6 relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Ready to experience Faith In?
              </h2>
              <p className="text-base text-charcoal-200">
                Create your free account today and discover a peaceful place for Scripture, prayer, and encouragement.
              </p>
              <div className="flex justify-center gap-4">
                <Link href={site.appPath} className="fi-btn fi-btn--primary fi-btn--lg">
                  <span>Open Faith In Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
