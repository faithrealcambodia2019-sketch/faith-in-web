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
  Sparkles,
  Cross,
  Users,
  Compass,
  Layers,
  MessageSquareHeart,
  Clock,
  ExternalLink,
  Flame,
  FileText,
  Volume2,
  Share2,
} from "lucide-react";

export const metadata: Metadata = {
  title: `About Us, Mission & Theology — ${site.name}`,
  description:
    "Learn about Faith In: our sacred mission, historic Christian orthodoxy, bilingual vision for Cambodia and the global diaspora, and commitment to a pure digital sanctuary.",
};

const pillars = [
  {
    number: "01",
    icon: BookOpen,
    title: "Christ-Centered & Biblically Grounded",
    titleKm: "ដក់ជាប់នឹងព្រះបន្ទូល និងព្រះគ្រីស្ទ",
    body: "We hold unconditionally to the divine authority, inerrancy, and sufficiency of God's Word. Our platform exists to exalt Jesus Christ, proclaim the Gospel of sovereign grace, and encourage deep, transformative Scripture study.",
    theology: "Sola Scriptura • Sola Gratia • Solus Christus",
    tone: "blue",
  },
  {
    number: "02",
    icon: Globe,
    title: "Bridging Khmer & Global Diaspora",
    titleKm: "ភ្ជាប់ខ្មែរទូទាំងពិភពលោកក្នុងព្រះគ្រីស្ទ",
    body: "From Phnom Penh, Battambang, and Siem Reap to California, Paris, Sydney, and Seoul—language, distance, and borders should never disconnect believers from their heritage or Christian fellowship.",
    theology: "One Body • Global Church • Fellowship",
    tone: "emerald",
  },
  {
    number: "03",
    icon: Shield,
    title: "A Pure Digital Sanctuary",
    titleKm: "ទីសក្ការៈឌីជីថលស្ងប់ស្ងាត់",
    body: "No commercial ads, no algorithmic anger, no data harvesting for advertisers. Faith In is intentionally architected as a reverent sanctuary where seekers and believers can pause, pray, and hear God speak.",
    theology: "Ad-Free • Reverence • Privacy",
    tone: "amber",
  },
  {
    number: "04",
    icon: Heart,
    title: "Accessible for Every Seeker",
    titleKm: "បើកចំហ និងឥតគិតថ្លៃសម្រាប់គ្រប់គ្នា",
    body: "100% free forever with zero paywalls. We welcome curious seekers and lifelong disciples alike with warmth, pastoral clarity, and unconditional Christlike love.",
    theology: "100% Free • Open to All • Grace",
    tone: "rose",
  },
];

const statementOfFaith = [
  {
    icon: Sparkles,
    topic: "The Triune God",
    topicKm: "ព្រះត្រៃឯក",
    desc: "We believe in one God, eternally existing in three distinct persons: Father, Son, and Holy Spirit, equal in power and glory.",
  },
  {
    icon: BookOpen,
    topic: "The Authority of Scripture",
    topicKm: "សិទ្ធិអំណាចនៃព្រះគម្ពីរ",
    desc: "The 66 books of the Old and New Testaments are God-breathed, fully reliable, and the supreme standard for faith and practice.",
  },
  {
    icon: Heart,
    topic: "Salvation by Grace Alone",
    topicKm: "សេចក្តីសង្គ្រោះដោយព្រះគុណ",
    desc: "Salvation is the free gift of God, received through faith alone in the finished atoning work of Jesus Christ on the cross.",
  },
  {
    icon: Users,
    topic: "The Church & Great Commission",
    topicKm: "ក្រុមជំនុំ និងមហាបេសកកម្ម",
    desc: "Called to proclaim the Gospel to all nations, make disciples, care for the needy, and live in holiness until Christ returns.",
  },
];

const platformFeatures = [
  {
    icon: BookOpen,
    title: "Bilingual Bible Studio",
    titleKm: "ស្ទូឌីយោព្រះគម្ពីរ ពីរភាសា",
    desc: "Khmer Standard, Khmer 1954, KJV, WEB, parallel comparison, and 48-Chapter Bruce L. Shelley Church History.",
  },
  {
    icon: MessageSquareHeart,
    title: "Prayer & Intercession Wall",
    titleKm: "ជញ្ជាំងអធិស្ឋានសហគមន៍",
    desc: "Share requests with privacy options, pray for fellow believers in Cambodia, and record answered prayers.",
  },
  {
    icon: Compass,
    title: "Scripture Card Designer",
    titleKm: "អ្នករចនាផ្ទាំងព្រះបន្ទូលខ្មែរ",
    desc: "Create beautiful, high-resolution Khmer Bible graphics and verse wallpapers to share hope across social media.",
  },
  {
    icon: Layers,
    title: "Structured Reading Plans",
    titleKm: "តារាងអានព្រះគម្ពីរជាប្រព័ន្ធ",
    desc: "Theological reading tracks, Gospels in 30 Days, Psalms of Comfort, and CPTI Ministry Foundations.",
  },
];

export default function AboutPage() {
  return (
    <div className="fi-page bg-[#FCFCFA] text-[#0D1017]">
      
      {/* ─────────────────────────────────────────────────────────────────────────
          1. HERO SECTION: Warm, Reverent & Atmospheric
          ───────────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 sm:pt-16 pb-16 sm:pb-24 overflow-hidden border-b border-[#EAE7DC]/60">
        
        {/* Ambient background glow */}
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(47,91,234,0.12),transparent_70%)] blur-3xl pointer-events-none"
        />

        <div className="fi-shell relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9EFFE] border border-[#C9D8FC] text-xs font-bold text-[#1E40AF] tracking-wide uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#2F5BEA]" />
              <span>Our Story, Mission &amp; Theological Vision • អំពីយើង</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0D1017] tracking-tight leading-[1.08]">
              A Sacred Sanctuary for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1877F2] to-[#2F5BEA]">
                God&apos;s Word.
              </span>
            </h1>

            {/* Khmer Subtitle */}
            <p className="text-lg sm:text-xl font-bold text-[#1E40AF] font-khmer leading-relaxed">
              សហគមន៍គ្រីស្ទានឌីជីថល ពីរភាសា សម្រាប់ការលូតលាស់ខាងវិញ្ញាណ និងការលើកទឹកចិត្ត
            </p>

            {/* Lead Narrative */}
            <p className="text-base sm:text-lg text-[#445166] leading-relaxed max-w-2xl mx-auto pt-1">
              Faith In was created to solve a deep need: providing a clean, distraction-free digital sanctuary where Khmer and English speakers worldwide can study Scripture, share prayers, and grow in Christ together.
            </p>

            {/* CTA Group */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
              <Link href={site.appPath} className="fi-btn fi-btn--primary fi-btn--lg shadow-md hover:shadow-lg transition">
                <span>Enter Bible Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#vision" className="fi-btn fi-btn--secondary fi-btn--lg">
                <span>Our 4 Guiding Pillars</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-[#445166]">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE7DC] shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#2F5BEA]" />
                100% Free Forever
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE7DC] shadow-2xs">
                <Shield className="w-4 h-4 text-[#059669]" />
                Zero Advertising
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE7DC] shadow-2xs">
                <Globe className="w-4 h-4 text-[#2F5BEA]" />
                Bilingual (Khmer • English)
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE7DC] shadow-2xs">
                <Heart className="w-4 h-4 text-rose-500" />
                Pastoral Care &amp; Safety
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          2. THE ORIGIN & VISION: The Heartbeat of Faith In
          ───────────────────────────────────────────────────────────────────────── */}
      <section className="fi-section bg-white">
        <div className="fi-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Narrative Story */}
            <div className="lg:col-span-7 space-y-5">
              <span className="fi-eyebrow">The Origin Story • រឿងរ៉ាវនៃជំនឿគ្រីស្ទាន</span>
              
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0D1017] tracking-tight leading-tight">
                One community, two languages, <span className="text-[#2F5BEA]">zero noise.</span>
              </h2>

              <p className="text-[15px] sm:text-base text-[#445166] leading-relaxed">
                In an era dominated by noisy algorithms, social media outrage, and intrusive ads, believers are starved for sacred stillness. Faith In was founded in 2019 to offer a pure, reverent alternative: a space dedicated entirely to God&apos;s Word, historic Christian heritage, and genuine prayer fellowship.
              </p>

              <div className="p-5 rounded-2xl bg-[#F7F9FF] border border-[#C9D8FC] space-y-2">
                <h3 className="text-base font-bold text-[#1E40AF] font-khmer">
                  «ព្រះបន្ទូលនៃព្រះ គឺជាពន្លឺបំភ្លឺផ្លូវនៃជីវិត»
                </h3>
                <p className="text-xs sm:text-sm text-[#445166] font-khmer leading-relaxed">
                  មិនថានៅភ្នំពេញ បាត់ដំបង សៀមរាប ឬនៅបរទេសដូចជាសហរដ្ឋអាមេរិក បារាំង អូស្ត្រាលី និងកូរ៉េទេ ភាសានិងព្រំដែនមិនគួរក្លាយជាឧបសគ្គរារាំងបងប្អូនគ្រីស្ទានខ្មែរពីការសិក្សាព្រះគម្ពីរ និងការរួបរួមគ្នាក្នុងព្រះគ្រីស្ទឡើយ។
                </p>
              </div>

              <p className="text-sm text-[#445166] leading-relaxed">
                Whether you are a seasoned pastor preparing a sermon, a new believer meditating on your first Bible verse, or a curious seeker exploring Christianity, Faith In is built for you.
              </p>

              <div className="pt-2 flex items-center gap-4">
                <Link href="/contact" className="fi-btn fi-btn--secondary">
                  <span>Contact Our Ministry Team</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Scripture & Credo Card */}
            <div className="lg:col-span-5 relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#2F5BEA]/20 to-[#059669]/10 blur-xl"
              />
              
              <div className="relative rounded-3xl border border-[#C9D8FC] bg-gradient-to-br from-white via-[#F7F9FF] to-[#E9EFFE] p-7 sm:p-9 shadow-lg space-y-6">
                
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center font-black text-xl shadow-md">
                    FI
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1E40AF] bg-white px-3 py-1 rounded-full border border-[#C9D8FC]">
                    EST. 2019
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#2F5BEA] uppercase tracking-wider">The Foundation Verse</div>
                  <div className="text-lg sm:text-xl font-serif italic text-[#0D1017] leading-snug">
                    «ដ្បិតព្រះស្រឡាញ់មនុស្សលោកដល់ម៉្លេះ បានជាទ្រង់ប្រទានព្រះរាជបុត្រាទ្រង់តែមួយ ដើម្បីកុំឲ្យអស់អ្នកណាដែលជឿដល់ព្រះរាជបុត្រានោះត្រូវវិនាសឡើយ គឺឲ្យមានជីវិតអស់កល្បជានិច្ចវិញ។»
                  </div>
                  <div className="text-xs font-bold text-[#1E40AF] pt-1">យ៉ូហាន ៣:១៦ • John 3:16</div>
                </div>

                <div className="pt-4 border-t border-[#C9D8FC]/60 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-[#DCE4FB] space-y-1">
                    <span className="font-bold text-[#0D1017] block">Sola Scriptura</span>
                    <span className="text-[#64748B]">Scripture Alone</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#DCE4FB] space-y-1">
                    <span className="font-bold text-[#0D1017] block">Sola Gratia</span>
                    <span className="text-[#64748B]">Grace Alone</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          3. GUIDING PILLARS: What We Believe & How We Build
          ───────────────────────────────────────────────────────────────────────── */}
      <section id="vision" className="fi-section fi-section--subtle">
        <div className="fi-shell">
          
          <div className="fi-head">
            <span className="fi-eyebrow">Guiding Pillars • គោលការណ៍គ្រឹះ</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0D1017] tracking-tight">
              What we believe and how we build.
            </h2>
            <p className="text-base text-[#445166] mt-3">
              Four unchanging commitments that shape every line of code, design choice, and community guideline on Faith In.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.number}
                  className="rounded-3xl border border-[#EAE7DC] bg-white p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-[#2F5BEA]/40 transition-all space-y-4 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-12 h-12 rounded-2xl bg-[#E9EFFE] border border-[#C9D8FC] text-[#2F5BEA] flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
                      <Icon className="w-6 h-6" />
                    </span>
                    <span className="text-3xl font-black text-[#D8D4C5] group-hover:text-[#2F5BEA] transition">
                      {p.number}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#0D1017]">{p.title}</h3>
                    <div className="text-sm font-bold text-[#2F5BEA] font-khmer mt-0.5">{p.titleKm}</div>
                  </div>

                  <p className="text-sm text-[#445166] leading-relaxed">
                    {p.body}
                  </p>

                  <div className="pt-2">
                    <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-[#1E40AF] bg-[#E9EFFE] px-2.5 py-1 rounded-md border border-[#C9D8FC]">
                      {p.theology}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          4. STATEMENT OF FAITH: Historic Christian Confession
          ───────────────────────────────────────────────────────────────────────── */}
      <section className="fi-section bg-white">
        <div className="fi-shell">
          
          <div className="fi-head">
            <span className="fi-eyebrow">Theological Foundations • សេចក្តីប្រកាសនៃជំនឿ</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0D1017] tracking-tight">
              Rooted in Historic Christian Orthodoxy
            </h2>
            <p className="text-base text-[#445166] mt-3">
              We stand firmly in the stream of biblical Christianity, embracing the timeless truths affirmed by the historic creeds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statementOfFaith.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#F7F6F0] border border-[#EAE7DC] space-y-3 hover:bg-white hover:border-[#2F5BEA]/40 hover:shadow-xs transition"
                >
                  <span className="w-10 h-10 rounded-xl bg-white border border-[#EAE7DC] text-[#2F5BEA] flex items-center justify-center shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#0D1017]">{item.topic}</h3>
                    <div className="text-xs font-bold text-[#1E40AF] font-khmer">{item.topicKm}</div>
                  </div>
                  <p className="text-xs sm:text-sm text-[#445166] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          5. PLATFORM CAPABILITIES: Tools for Discipleship
          ───────────────────────────────────────────────────────────────────────── */}
      <section className="fi-section fi-section--subtle">
        <div className="fi-shell">
          
          <div className="fi-head">
            <span className="fi-eyebrow">Platform Tools • ឧបករណ៍ និងធនធានសិក្សា</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0D1017] tracking-tight">
              Tools Built for Deep Spiritual Growth
            </h2>
            <p className="text-base text-[#445166] mt-3">
              Everything you need for personal devotion, pastoral preparation, and community prayer in one seamless experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platformFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 sm:p-7 rounded-3xl bg-white border border-[#EAE7DC] flex items-start gap-4 shadow-2xs hover:shadow-sm transition"
                >
                  <span className="w-12 h-12 rounded-2xl bg-[#E9EFFE] border border-[#C9D8FC] text-[#2F5BEA] flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-[#0D1017]">{feat.title}</h3>
                    <div className="text-xs sm:text-sm font-semibold text-[#2F5BEA] font-khmer">{feat.titleKm}</div>
                    <p className="text-xs sm:text-sm text-[#445166] leading-relaxed pt-1">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          6. COMMUNITY STANDARDS & REVERENCE
          ───────────────────────────────────────────────────────────────────────── */}
      <section id="ethics" className="fi-section bg-white">
        <div className="fi-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <span className="fi-eyebrow">Community Standards • សុវត្ថិភាពសហគមន៍</span>
              <h2 className="text-3xl font-extrabold text-[#0D1017] tracking-tight leading-tight">
                A respectful, moderated digital sanctuary
              </h2>
              <p className="text-sm text-[#445166] leading-relaxed">
                We maintain active pastoral and technical moderation to safeguard our community from harassment, political disputes, commercial spam, and harmful content—so the stillness you came for stays undisturbed.
              </p>
              <div className="pt-2">
                <Link href="/contact" className="fi-btn fi-btn--secondary">
                  <span>Report a Concern / ស្នើសុំជំនួយ</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-3xl border border-[#EAE7DC] bg-[#FAF9F5] p-6 sm:p-8 space-y-4">
              {[
                {
                  title: "Zero Tolerance for Harm",
                  titleKm: "គ្មានការអត់ឱនចំពោះការបំពាន",
                  body: "Hate speech, harassment, scam solicitations, and divisive debates are immediately removed.",
                },
                {
                  title: "Anonymous Prayer Protection",
                  titleKm: "ការការពារសេចក្តីអធិស្ឋានសម្ងាត់",
                  body: "Vulnerable and sensitive personal requests can be shared securely without exposing your identity.",
                },
                {
                  title: "Sacred Data Privacy",
                  titleKm: "ការការពារទិន្នន័យផ្ទាល់ខ្លួន",
                  body: "Your journal entries, prayer notes, and reading history belong solely to you. Nothing is ever sold to brokers or advertisers.",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#EAE7DC] shadow-2xs">
                  <span className="w-8 h-8 rounded-xl bg-[#ECFDF5] border border-[#D1FAE5] text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#0D1017]">{item.title} • <span className="text-[#1E40AF] font-khmer">{item.titleKm}</span></h3>
                    <p className="text-xs text-[#445166] leading-relaxed mt-1">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          7. INSPIRING CALL TO ACTION BANNER
          ───────────────────────────────────────────────────────────────────────── */}
      <section className="fi-section fi-section--subtle">
        <div className="fi-shell">
          <div className="fi-cta-banner rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden bg-gradient-to-r from-[#1877F2] to-[#1E40AF] text-white shadow-xl">
            
            <div className="max-w-2xl mx-auto space-y-6 relative z-10">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Everyone is welcome • បើកចំហសម្រាប់គ្រប់គ្នា
              </span>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Walk with us in faith.
              </h2>

              <p className="text-base text-white/90 leading-relaxed font-khmer">
                សូមអញ្ជើញចូលរួមទទួលយកបទពិសោធន៍ថ្មី នៃការសិក្សាព្រះគម្ពីរ ការអធិស្ឋាន និងការរួបរួមក្នុងសហគមន៍គ្រីស្ទានដោយគ្មានការរំខាន។
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link href={site.appPath} className="px-7 py-3.5 rounded-xl bg-white text-[#1877F2] font-black text-sm hover:bg-white/95 shadow-lg transition">
                  <span>Enter Bible Studio</span>
                </Link>
                <Link href="/contact" className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-sm backdrop-blur-sm transition">
                  <span>Connect with Us</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

