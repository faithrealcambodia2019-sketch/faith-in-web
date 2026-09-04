import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site-content";
import { HeroInteractiveWidget } from "@/components/marketing/HeroInteractiveWidget";
import { FaithJourneyPathway } from "@/components/marketing/FaithJourneyPathway";
import { PersonaSelector } from "@/components/marketing/PersonaSelector";
import { TrustImpactSection } from "@/components/marketing/TrustImpactSection";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Headphones,
  Heart,
  Palette,
  Briefcase,
  Users,
  ShieldCheck,
  CheckCircle2,
  Globe,
} from "lucide-react";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
};

export default function HomePage() {
  return (
    <div className="fi-page">
      {/* =========================================================================
          HERO SECTION: Emotional headline, dual CTAs, live interactive preview
          ========================================================================= */}
      <section className="fi-hero">
        <div className="fi-shell">
          <div className="fi-hero__grid">
            {/* Hero Left Copy */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9EFFE] border border-[#C9D8FC] text-xs font-bold text-[#1E40AF] shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#2F5BEA]" />
                <span>Bilingual Christian Community • សហគមន៍គ្រីស្ទបរិស័ទ</span>
              </div>

              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-charcoal-900 tracking-tight leading-[1.08]">
                  Discover hope, purpose and faith for your{" "}
                  <span className="fi-hero-highlight">journey.</span>
                </h1>

                <p className="fi-hero__lead mt-4 text-lg sm:text-xl text-charcoal-600 leading-relaxed max-w-xl">
                  A modern, peaceful sanctuary for side-by-side Khmer–English Bible study, uplifting spoken audio blessings, heartfelt prayer, and genuine fellowship.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="fi-hero__cta-group pt-2">
                <Link
                  href={site.appPath}
                  className="fi-btn fi-btn--primary fi-btn--lg group shadow-glow"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/bible-study"
                  className="fi-btn fi-btn--secondary fi-btn--lg"
                >
                  <BookOpen className="w-4 h-4 text-[#2F5BEA]" />
                  <span>Explore Bible Studio</span>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="fi-trust-row">
                <div className="fi-trust-item">
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  <span className="font-semibold text-charcoal-800">100% Free Forever</span>
                </div>
                <div className="fi-trust-item">
                  <ShieldCheck className="w-4 h-4 text-[#2F5BEA]" />
                  <span className="font-semibold text-charcoal-800">No Ads or Data Selling</span>
                </div>
                <div className="fi-trust-item">
                  <Globe className="w-4 h-4 text-[#2F5BEA]" />
                  <span className="font-semibold text-charcoal-800">Global Diaspora Fellowship</span>
                </div>
              </div>
            </div>

            {/* Hero Right: Live Interactive Widget */}
            <div className="w-full flex justify-center lg:justify-end">
              <HeroInteractiveWidget />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          JOURNEY SECTION: Discover -> Explore -> Connect -> Grow
          ========================================================================= */}
      <section id="pathway" className="fi-section fi-section--subtle">
        <div className="fi-shell">
          <div className="fi-head">
            <span className="fi-eyebrow">The Pathway • មាគ៌ានៃជំនឿ</span>
            <h2>A simple pathway for your spiritual walk</h2>
            <p>
              Whether you are discovering Christianity for the first time or seeking deeper discipleship, Faith In guides your next step with reverence and clarity.
            </p>
          </div>

          <FaithJourneyPathway />
        </div>
      </section>

      {/* =========================================================================
          EXPERIENCES & FEATURES GRID: Premium visual cards
          ========================================================================= */}
      <section className="fi-section">
        <div className="fi-shell">
          <div className="fi-head">
            <span className="fi-eyebrow">Core Experiences • មុខងារសំខាន់ៗ</span>
            <h2>Engineered for deep reflection and fellowship</h2>
            <p>
              Every detail is designed to remove friction, enhance typographic beauty in Khmer and English, and nurture authentic spiritual growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1: Bilingual Scripture */}
            <div className="bg-[#F0F2F5] rounded-[24px] p-6 sm:p-8 hover:bg-[#E4E6EB] transition-colors cursor-pointer group flex flex-col justify-between border-0 shadow-none">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-3 w-fit shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Scripture • ព្រះគម្ពីរ
                  </div>
                  <h3 className="text-xl font-extrabold text-charcoal-900 leading-tight">
                    Bilingual Bible Studio
                  </h3>
                </div>

                <p className="text-[15px] text-charcoal-600 leading-relaxed">
                  Read Khmer Standard Version alongside English translations with customized line heights, syllable handling, and instant verse lookups.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-300/50 flex items-center justify-between text-xs font-bold">
                <Link
                  href="/bible-study"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 group-hover:text-blue-800 transition-colors"
                >
                  <span>Explore Bible Studio</span>
                  <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </div>
            </div>

            {/* Card 2: Audio Blessings */}
            <div className="bg-[#F0F2F5] rounded-[24px] p-6 sm:p-8 hover:bg-[#E4E6EB] transition-colors cursor-pointer group flex flex-col justify-between border-0 shadow-none">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-3 w-fit shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <Headphones className="w-8 h-8 text-teal-600" strokeWidth={2.5} />
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-700">
                    Spoken Blessings • សម្លេងព្រះពរ
                  </div>
                  <h3 className="text-xl font-extrabold text-charcoal-900 leading-tight">
                    Daily Audio Devotionals
                  </h3>
                </div>

                <p className="text-[15px] text-charcoal-600 leading-relaxed">
                  Start and end each day in tranquility with soothing spoken Scripture, morning declarations of grace, and peaceful melodies.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-300/50 flex items-center justify-between text-xs font-bold">
                <Link
                  href={site.appPath}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 group-hover:text-teal-800 transition-colors"
                >
                  <span>Listen to Blessings</span>
                  <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </div>
            </div>

            {/* Card 3: Prayer Wall */}
            <div className="bg-[#F0F2F5] rounded-[24px] p-6 sm:p-8 hover:bg-[#E4E6EB] transition-colors cursor-pointer group flex flex-col justify-between border-0 shadow-none">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-3 w-fit shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-teal-500" strokeWidth={2.5} />
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-700">
                    Intercession • បន្ទប់អធិស្ឋាន
                  </div>
                  <h3 className="text-xl font-extrabold text-charcoal-900 leading-tight">
                    Global Prayer Sanctuary
                  </h3>
                </div>

                <p className="text-[15px] text-charcoal-600 leading-relaxed">
                  Share your burdens and celebrate victories. Post publicly or anonymously and know that believers worldwide are praying for you.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-300/50 flex items-center justify-between text-xs font-bold">
                <Link
                  href={site.appPath}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 group-hover:text-teal-800 transition-colors"
                >
                  <span>Visit Prayer Wall</span>
                  <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </div>
            </div>

            {/* Card 4: Scripture Design Studio */}
            <div className="bg-[#F0F2F5] rounded-[24px] p-6 sm:p-8 hover:bg-[#E4E6EB] transition-colors cursor-pointer group flex flex-col justify-between border-0 shadow-none">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-3 w-fit shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <Palette className="w-8 h-8 text-purple-500" strokeWidth={2.5} />
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
                    Creative Gospel • រចនារូបភាព
                  </div>
                  <h3 className="text-xl font-extrabold text-charcoal-900 leading-tight">
                    Scripture Card Designer
                  </h3>
                </div>

                <p className="text-[15px] text-charcoal-600 leading-relaxed">
                  Turn your favorite verses into striking visual artwork with curated wallpapers, Khmer calligraphy layouts, and instant export for Telegram &amp; Instagram.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-300/50 flex items-center justify-between text-xs font-bold">
                <Link
                  href="/bible-study#designer"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-purple-700 group-hover:text-purple-800 transition-colors"
                >
                  <span>Create Verse Cards</span>
                  <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </div>
            </div>

            {/* Card 5: Christian Jobs & Ministry */}
            <div className="bg-[#F0F2F5] rounded-[24px] p-6 sm:p-8 hover:bg-[#E4E6EB] transition-colors cursor-pointer group flex flex-col justify-between border-0 shadow-none">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-3 w-fit shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <Briefcase className="w-8 h-8 text-orange-500" strokeWidth={2.5} />
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-orange-700">
                    Calling &amp; Ministry • ឱកាសការងារ
                  </div>
                  <h3 className="text-xl font-extrabold text-charcoal-900 leading-tight">
                    Christian Career Network
                  </h3>
                </div>

                <p className="text-[15px] text-charcoal-600 leading-relaxed">
                  Discover career opportunities with faith-based organizations, churches, mission teams, and non-profits across Southeast Asia and beyond.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-300/50 flex items-center justify-between text-xs font-bold">
                <Link
                  href="/features"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-700 group-hover:text-orange-800 transition-colors"
                >
                  <span>Browse Opportunities</span>
                  <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </div>
            </div>

            {/* Card 6: Church Ministry Toolkit */}
            <div className="bg-[#F0F2F5] rounded-[24px] p-6 sm:p-8 hover:bg-[#E4E6EB] transition-colors cursor-pointer group flex flex-col justify-between border-0 shadow-none">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-3 w-fit shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <Users className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    For Churches • សម្រាប់ក្រុមជំនុំ
                  </div>
                  <h3 className="text-xl font-extrabold text-charcoal-900 leading-tight">
                    Church Discipleship Toolkit
                  </h3>
                </div>

                <p className="text-[15px] text-charcoal-600 leading-relaxed">
                  Equip your pastors, youth leaders, and home fellowship groups with digital discipleship tools, sermon media templates, and coordinated prayer chains.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-300/50 flex items-center justify-between text-xs font-bold">
                <Link
                  href="/for-churches"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 group-hover:text-blue-800 transition-colors"
                >
                  <span>Church Solutions</span>
                  <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PERSONALISATION SECTION: "Where are you on your journey?"
          ========================================================================= */}
      <section className="fi-section fi-section--subtle">
        <div className="fi-shell">
          <div className="fi-head">
            <span className="fi-eyebrow">Personalized Walk • សម្រាប់រូបអ្នក</span>
            <h2>Where are you on your journey?</h2>
            <p>
              Faith In adapts to where God has you right now. Choose your current stage to find the most helpful tools and resources.
            </p>
          </div>

          <PersonaSelector />
        </div>
      </section>

      {/* =========================================================================
          TRUST, IMPACT & TESTIMONIALS SECTION
          ========================================================================= */}
      <section className="fi-section">
        <div className="fi-shell">
          <div className="fi-head">
            <span className="fi-eyebrow">Global Fellowship • សាកលលោក</span>
            <h2>Built for faith journeys that cross borders</h2>
            <p>
              Thoughtful tools for bilingual families, daily spiritual rhythms, and prayer-centered communities—wherever your journey takes you.
            </p>
          </div>

          <TrustImpactSection />
        </div>
      </section>

      {/* =========================================================================
          FAQ SECTION
          ========================================================================= */}
      <section className="fi-section fi-section--subtle">
        <div className="fi-shell">
          <div className="fi-head">
            <span className="fi-eyebrow">Questions &amp; Answers • សំណួរញឹកញាប់</span>
            <h2>Everything you need to know</h2>
            <p>
              Clear, transparent answers about Faith In, our theology, privacy practices, and church partnerships.
            </p>
          </div>

          <FaqAccordion />
        </div>
      </section>

      {/* =========================================================================
          BOTTOM INVITATION BANNER (CTA)
          ========================================================================= */}
      <section className="fi-section pb-20">
        <div className="fi-shell">
          <div className="fi-cta-banner">
            <div className="max-w-2xl mx-auto space-y-6 relative z-10">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-xs font-bold text-[#5C81F2] border border-white/15">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Join the Community Today</span>
              </span>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Begin your journey with peace, hope, and purpose.
              </h2>

              <p className="text-base sm:text-lg text-charcoal-200 leading-relaxed max-w-xl mx-auto">
                Explore bilingual Scripture, share daily blessings, and pray with a community designed around dignity and encouragement. 100% free, forever.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={site.appPath}
                  className="fi-btn fi-btn--primary fi-btn--lg shadow-glow"
                >
                  <span>Open Faith In Community</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/contact"
                  className="fi-btn fi-btn--secondary fi-btn--lg bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <span>Talk to Our Team</span>
                </Link>
              </div>

              <div className="pt-4 text-xs text-charcoal-400">
                Works in modern mobile and desktop browsers • No credit card or subscription required
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
