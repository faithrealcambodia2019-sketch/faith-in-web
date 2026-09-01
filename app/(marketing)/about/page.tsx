import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site-content";
import {
  ArrowRight,
  Heart,
  Shield,
  Globe,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: `About Us & Mission — ${site.name}`,
  description:
    "Learn about Faith In: our mission, Christ-centered theological values, bilingual vision for Cambodia and the global diaspora, and commitment to privacy and reverence.",
};

export default function AboutPage() {
  return (
    <div className="fi-page">
      {/* Hero */}
      <section className="fi-hero pb-12">
        <div className="fi-shell text-center max-w-3xl mx-auto space-y-4">
          <span className="fi-eyebrow">Our Story &amp; Mission • អំពីយើង</span>
          <h1 className="text-4xl sm:text-5xl font-black text-charcoal-900 tracking-tight leading-tight">
            Built with reverence, grace, and <span className="fi-hero-highlight">purpose.</span>
          </h1>
          <p className="text-lg text-charcoal-600 leading-relaxed">
            Faith In was created to solve a deep need: providing a clean, distraction-free digital sanctuary where Khmer and English speakers worldwide can study Scripture, share blessings, and pray together.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link href={site.appPath} className="fi-btn fi-btn--primary">
              <span>Join the Community</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="fi-btn fi-btn--secondary">
              <span>Contact Team</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section id="vision" className="fi-section fi-section--subtle">
        <div className="fi-shell">
          <div className="fi-head">
            <span className="fi-eyebrow">Guiding Pillars • គោលការណ៍គ្រឹះ</span>
            <h2>What we believe and how we build</h2>
            <p>
              Four unchanging commitments that shape every line of code, design choice, and community rule on Faith In.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pillar 1 */}
            <div className="fi-card space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF7E6] border border-[#FCE8BF] text-[#B87814] flex items-center justify-center shadow-xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-charcoal-900">
                1. Christ-Centered &amp; Biblically Grounded
              </h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                We believe in the authority and power of God&apos;s Word. Our platform exists to point people to Jesus Christ, celebrate the Gospel of grace, and encourage deep, thoughtful Scripture meditation.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="fi-card space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center shadow-xs">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-charcoal-900">
                2. Bridging the Khmer &amp; Global Diaspora
              </h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Whether in Phnom Penh, Battambang, California, Paris, Sydney, or Seoul, language and borders should never disconnect believers from their heritage or Christian fellowship.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="fi-card space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] border border-[#D1FAE5] text-[#059669] flex items-center justify-center shadow-xs">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-charcoal-900">
                3. A True Digital Sanctuary
              </h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                No algorithms incentivizing anger, no commercial banner ads, no selling user data to brokers. Faith In is designed to cultivate stillness, peace, and spiritual reflection.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="fi-card space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DC] text-charcoal-800 flex items-center justify-center shadow-xs">
                <Heart className="w-6 h-6 text-[#D9941E]" />
              </div>
              <h3 className="text-xl font-extrabold text-charcoal-900">
                4. Accessible for Every Seeker
              </h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                100% free to access, with zero paywalls. We welcome curious seekers with warmth, clarity, and unconditional respect as they explore the Christian faith.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Ethics */}
      <section id="ethics" className="fi-section">
        <div className="fi-shell">
          <div className="bg-[#FAF9F5] border border-[#EAE7DC] rounded-3xl p-8 sm:p-12 space-y-6 max-w-3xl mx-auto">
            <div className="space-y-2 text-center">
              <span className="fi-eyebrow">Community Standards</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
                A respectful, moderated community
              </h2>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                We maintain active pastoral and technical moderation to protect users from harassment, spam, political warfare, and unwholesome content.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#EAE7DC]">
              <div className="flex items-start gap-3 text-sm text-charcoal-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Zero tolerance for hate speech, scams, spam, or hostile debate.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-charcoal-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Anonymous prayer option protects vulnerability and sensitive personal matters.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-charcoal-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Transparent data practices: what you write belongs to you.</span>
              </div>
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
                Walk with us in faith.
              </h2>
              <p className="text-base text-charcoal-200">
                Experience the difference of a community built around God&apos;s Word and genuine prayer.
              </p>
              <div className="flex justify-center gap-4">
                <Link href={site.appPath} className="fi-btn fi-btn--primary fi-btn--lg">
                  <span>Enter Faith In</span>
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
