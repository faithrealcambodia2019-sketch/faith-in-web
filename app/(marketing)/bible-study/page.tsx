import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site-content";
import {
  ArrowRight,
  Palette,
  Share2,
  Type,
} from "lucide-react";

export const metadata: Metadata = {
  title: `Bilingual Bible Studio — ${site.name}`,
  description:
    "Read, compare, and design Scripture in Khmer and English. Side-by-side Khmer Standard Version and English translations with optimized typography and verse card creation.",
};

export default function BibleStudyPage() {
  return (
    <div className="fi-page">
      {/* Hero */}
      <section className="fi-hero pb-12">
        <div className="fi-shell text-center max-w-3xl mx-auto space-y-4">
          <span className="fi-eyebrow">Bilingual Scripture • ព្រះគម្ពីរ</span>
          <h1 className="text-4xl sm:text-5xl font-black text-charcoal-900 tracking-tight leading-tight">
            Study Scripture in <span className="fi-hero-highlight">Khmer and English</span>, together.
          </h1>
          <p className="text-lg text-charcoal-600 leading-relaxed">
            Engineered specifically for bilingual believers, diaspora families, language learners, and youth ministries. Experience the Word of God with crystal-clear Khmer typography and parallel English text.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link href={site.appPath} className="fi-btn fi-btn--primary">
              <span>Open Bible Reader</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#designer" className="fi-btn fi-btn--secondary">
              <span>Explore Verse Designer</span>
            </a>
          </div>
        </div>
      </section>

      {/* Live Side-by-Side Scripture Reader Demo */}
      <section className="fi-section fi-section--subtle">
        <div className="fi-shell">
          <div className="fi-head">
            <span className="fi-eyebrow">Parallel Reading • អានព្រះគម្ពីរទន្ទឹមគ្នា</span>
            <h2>Parallel translations side by side</h2>
            <p>
              Compare nuances between the Khmer Standard Version and English translations verse by verse without losing your place.
            </p>
          </div>

          <div className="bg-white border border-[#EAE7DC] rounded-3xl p-6 sm:p-10 shadow-lg max-w-4xl mx-auto space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#EAE7DC]">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#FEF7E6] text-[#B87814] text-xs font-bold border border-[#FCE8BF]">
                  John 1:1-5 • យ៉ូហាន ១:១-៥
                </span>
                <span className="text-xs text-charcoal-500 font-semibold">Khmer Standard &amp; ESV</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-charcoal-600">
                <span className="px-2.5 py-1 rounded bg-[#F7F6F0]">Font Size: 18px</span>
                <span className="px-2.5 py-1 rounded bg-[#F7F6F0]">Line Height: 1.85</span>
              </div>
            </div>

            {/* Verse Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DC]/60">
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#B87814]">យ៉ូហាន ១:១ (Khmer)</div>
                <p className="text-base font-khmer text-charcoal-900 leading-relaxed font-medium">
                  «នៅ​ដើម​ដំបូង មាន​ព្រះបន្ទូល ព្រះបន្ទូល​នៅ​ជា​មួយ​នឹង​ព្រះ ហើយ​ព្រះបន្ទូល​ជា​ព្រះ។»
                </p>
              </div>

              <div className="space-y-1 md:border-l md:border-[#EAE7DC] md:pl-6">
                <div className="text-xs font-bold text-[#2563EB]">John 1:1 (English)</div>
                <p className="text-base font-serif italic text-charcoal-700 leading-relaxed">
                  &ldquo;In the beginning was the Word, and the Word was with God, and the Word was God.&rdquo;
                </p>
              </div>
            </div>

            {/* Verse Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DC]/60">
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#B87814]">យ៉ូហាន ១:៤-៥ (Khmer)</div>
                <p className="text-base font-khmer text-charcoal-900 leading-relaxed font-medium">
                  «ជីវិត​នៅ​ក្នុង​ព្រះបន្ទូល ហើយ​ជីវិត​នោះ​ជា​ពន្លឺ​របស់​មនុស្ស​លោក។ ពន្លឺ​នោះ​ភ្លឺ​នៅ​ក្នុង​សេចក្ដី​ងងឹត ប៉ុន្តែ​សេចក្ដី​ងងឹត​មិន​បាន​យល់​ពន្លឺ​នោះ​ទេ។»
                </p>
              </div>

              <div className="space-y-1 md:border-l md:border-[#EAE7DC] md:pl-6">
                <div className="text-xs font-bold text-[#2563EB]">John 1:4-5 (English)</div>
                <p className="text-base font-serif italic text-charcoal-700 leading-relaxed">
                  &ldquo;In him was life, and the life was the light of men. The light shines in the darkness, and the darkness has not overcome it.&rdquo;
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <span className="text-xs text-charcoal-500 font-medium">
                Instant cross-references, verse highlighting, and notes sync
              </span>

              <Link href={site.appPath} className="fi-btn fi-btn--primary fi-btn--sm">
                <span>Start Reading in App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Scripture Card Designer Section */}
      <section id="designer" className="fi-section">
        <div className="fi-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="fi-eyebrow">Creative Studio • រចនារូបភាព</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
                Turn verses into shareable Gospel art cards.
              </h2>
              <p className="text-base text-charcoal-600 leading-relaxed">
                Khmer script requires specialized typography rules, vowel positioning, and spacing that standard graphic tools often break. Our studio formats Khmer typography to look stunning every time.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-charcoal-800">
                  <div className="w-8 h-8 rounded-lg bg-[#FEF7E6] text-[#B87814] flex items-center justify-center shrink-0">
                    <Type className="w-4 h-4" />
                  </div>
                  <span>Accurate Khmer vowel &amp; sub-consonant ligature rendering</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-charcoal-800">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                    <Palette className="w-4 h-4" />
                  </div>
                  <span>Curated natural wallpapers and reverent color palettes</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-charcoal-800">
                  <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span>Instant 1-click export for Telegram stickers, Instagram stories, and Facebook</span>
                </div>
              </div>

              <div className="pt-4">
                <Link href={site.appPath} className="fi-btn fi-btn--primary">
                  <span>Open Scripture Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Studio Card Preview */}
            <div className="lg:col-span-6">
              <div className="bg-gradient-to-tr from-[#1E2431] to-[#0D1017] p-8 sm:p-10 rounded-3xl text-white shadow-2xl space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-charcoal-400">
                  <span className="font-bold text-[#EBB94F]">FAITH IN STUDIO</span>
                  <span>1080 &times; 1080px HD</span>
                </div>

                <div className="p-6 sm:p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-4 shadow-inner">
                  <div className="text-xl sm:text-2xl font-khmer font-bold text-white leading-relaxed">
                    «ព្រះ​យេហូវ៉ា​ជា​អ្នក​គង្វាល​ខ្ញុំ ខ្ញុំ​នឹង​មិន​ខ្វះ​អ្វី​ឡើយ»
                  </div>
                  <div className="text-sm font-serif italic text-charcoal-200">
                    &ldquo;The LORD is my shepherd; I shall not want.&rdquo;
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#EBB94F] pt-2">
                    ទំនុកតម្កើង ២៣:១ • PSALM 23:1
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-charcoal-400 pt-2">
                  <span>Custom Fonts • Gradient Filters • Export Ready</span>
                  <span className="text-[#EBB94F] font-semibold">100% Free</span>
                </div>
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
                Deepen your Bible study today.
              </h2>
              <p className="text-base text-charcoal-200">
                Experience Scripture in your heart language with intuitive bilingual tools.
              </p>
              <div className="flex justify-center gap-4">
                <Link href={site.appPath} className="fi-btn fi-btn--primary fi-btn--lg">
                  <span>Launch Bible Studio</span>
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
