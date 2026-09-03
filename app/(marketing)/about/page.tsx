import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site-content";
import { BrandWordmark } from "@/components/marketing/BrandWordmark";
import {
  ArrowRight,
  Heart,
  Shield,
  Globe,
  BookOpen,
  CheckCircle2,
  Languages,
  MessageCircleHeart,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: `About Us & Mission — ${site.name}`,
  description:
    "Learn about Faith In: our mission, Christ-centered theological values, bilingual vision for Cambodia and the global diaspora, and commitment to privacy and reverence.",
};

const pillars = [
  {
    number: "01",
    icon: BookOpen,
    title: "Christ-Centered & Biblically Grounded",
    titleKm: "ដក់ជាប់នឹងព្រះបន្ទូល",
    body: "We believe in the authority and power of God's Word. Our platform exists to point people to Jesus Christ, celebrate the Gospel of grace, and encourage deep, thoughtful Scripture meditation.",
    tone: "brand" as const,
  },
  {
    number: "02",
    icon: Globe,
    title: "Bridging the Khmer & Global Diaspora",
    titleKm: "ភ្ជាប់ខ្មែរទូទាំងពិភពលោក",
    body: "Whether in Phnom Penh, Battambang, California, Paris, Sydney, or Seoul, language and borders should never disconnect believers from their heritage or Christian fellowship.",
    tone: "deep" as const,
  },
  {
    number: "03",
    icon: Shield,
    title: "A True Digital Sanctuary",
    titleKm: "ទីសក្ការៈឌីជីថល",
    body: "No algorithms incentivizing anger, no commercial banner ads, no selling user data to brokers. Faith In is designed to cultivate stillness, peace, and spiritual reflection.",
    tone: "sage" as const,
  },
  {
    number: "04",
    icon: Heart,
    title: "Accessible for Every Seeker",
    titleKm: "បើកចំហសម្រាប់គ្រប់គ្នា",
    body: "100% free to access, with zero paywalls. We welcome curious seekers with warmth, clarity, and unconditional respect as they explore the Christian faith.",
    tone: "brand" as const,
  },
];

const toneStyles = {
  brand: "bg-[#E9EFFE] border-[#C9D8FC] text-[#2F5BEA]",
  deep: "bg-[#E9EFFE] border-[#C9D8FC] text-[#1E40AF]",
  sage: "bg-[#ECFDF5] border-[#D1FAE5] text-[#059669]",
};

const promises = [
  { icon: Languages, label: "Khmer & English", sub: "ខ្មែរ • EN" },
  { icon: Heart, label: "Free forever", sub: "No paywalls" },
  { icon: Shield, label: "No ads, ever", sub: "Your data stays yours" },
  { icon: MessageCircleHeart, label: "Moderated daily", sub: "Pastoral & technical" },
];

export default function AboutPage() {
  return (
    <div className="fi-page">
      {/* Hero */}
      <section className="fi-hero pb-16">
        <div className="fi-shell">
          <div className="fi-hero__grid">
            {/* Left: the story */}
            <div>
              <span className="fi-eyebrow">Our Story &amp; Mission • អំពីយើង</span>
              <h1 className="text-4xl sm:text-5xl font-black text-charcoal-900 tracking-tight leading-[1.08] mt-4">
                Built with reverence, grace, and{" "}
                <span className="fi-hero-highlight">purpose.</span>
              </h1>
              <p className="fi-hero__lead mt-5">
                Faith In was created to solve a deep need: a clean, distraction-free digital
                sanctuary where Khmer and English speakers worldwide can study Scripture, share
                blessings, and pray together.
              </p>

              <div className="fi-hero__cta-group">
                <Link href={site.appPath} className="fi-btn fi-btn--primary fi-btn--lg">
                  <span>Join the Community</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/contact" className="fi-btn fi-btn--secondary fi-btn--lg">
                  <span>Contact Team</span>
                </Link>
              </div>

              <div className="fi-trust-row">
                <span className="fi-trust-item">
                  <CheckCircle2 className="w-4 h-4 text-[#2F5BEA]" />
                  Free forever
                </span>
                <span className="fi-trust-item">
                  <CheckCircle2 className="w-4 h-4 text-[#2F5BEA]" />
                  No advertising
                </span>
                <span className="fi-trust-item">
                  <CheckCircle2 className="w-4 h-4 text-[#2F5BEA]" />
                  Bilingual by design
                </span>
              </div>
            </div>

            {/* Right: the brand card */}
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-[36px] bg-[radial-gradient(circle_at_30%_20%,rgba(47,91,234,0.16),transparent_70%)] blur-xl"
              />
              <div className="relative rounded-[28px] border border-[#C9D8FC] bg-gradient-to-br from-[#E9EFFE] via-white to-[#F7F9FF] p-8 sm:p-10 shadow-[0_24px_50px_-16px_rgba(47,91,234,0.28)]">
                <BrandWordmark textClassName="text-3xl sm:text-4xl" />

                <p className="mt-5 text-[0.95rem] leading-relaxed text-charcoal-700">
                  One community, two languages, no noise. Faith In carries the same reverence
                  from Phnom Penh to the diaspora — Scripture, prayer, and fellowship in the
                  language of your heart.
                </p>

                <p className="mt-3 text-sm leading-loose text-charcoal-600">
                  សហគមន៍តែមួយ ពីរភាសា ដោយគ្មានការរំខាន។
                </p>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  {promises.map((promise) => (
                    <div
                      key={promise.label}
                      className="rounded-2xl bg-white/85 border border-[#DCE4FB] px-4 py-3.5 backdrop-blur-sm"
                    >
                      <promise.icon className="w-4 h-4 text-[#2F5BEA]" />
                      <div className="mt-2 text-sm font-bold text-charcoal-900 leading-tight">
                        {promise.label}
                      </div>
                      <div className="text-xs text-charcoal-500 mt-0.5">{promise.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guiding pillars */}
      <section id="vision" className="fi-section fi-section--subtle">
        <div className="fi-shell">
          <div className="fi-head">
            <span className="fi-eyebrow">Guiding Pillars • គោលការណ៍គ្រឹះ</span>
            <h2>What we believe and how we build</h2>
            <p>
              Four unchanging commitments that shape every line of code, design choice, and
              community rule on Faith In.
            </p>
          </div>

          <div className="fi-grid-2">
            {pillars.map((pillar) => (
              <article key={pillar.number} className="fi-card group">
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-xs ${toneStyles[pillar.tone]}`}
                  >
                    <pillar.icon className="w-6 h-6" />
                  </span>
                  <span className="text-2xl font-black text-[#C9D8FC] leading-none tracking-tight group-hover:text-[#2F5BEA] transition-colors">
                    {pillar.number}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-extrabold text-charcoal-900 leading-snug">
                  {pillar.title}
                </h3>
                <p className="mt-1 text-sm font-semibold text-[#2F5BEA] leading-loose">
                  {pillar.titleKm}
                </p>
                <p className="mt-3 text-sm text-charcoal-600 leading-relaxed">{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Community standards */}
      <section id="ethics" className="fi-section">
        <div className="fi-shell">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-center">
            <div>
              <span className="fi-eyebrow">Community Standards</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight leading-tight">
                A respectful, moderated community
              </h2>
              <p className="mt-4 text-base text-charcoal-600 leading-relaxed">
                We maintain active pastoral and technical moderation to protect users from
                harassment, spam, political warfare, and unwholesome content — so the quiet you
                came for stays quiet.
              </p>
              <Link href="/contact" className="fi-btn fi-btn--secondary mt-7">
                <span>Report a concern</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="rounded-3xl border border-[#C9D8FC] bg-gradient-to-br from-white to-[#F7F9FF] p-6 sm:p-8 shadow-sm divide-y divide-[#E6EBF9]">
              {[
                {
                  title: "Zero tolerance for harm",
                  body: "Hate speech, scams, spam, and hostile debate are removed — not ranked.",
                },
                {
                  title: "Anonymous prayer",
                  body: "Vulnerability and sensitive personal matters can be shared without a name attached.",
                },
                {
                  title: "Transparent data practices",
                  body: "What you write belongs to you. Nothing is sold to brokers or advertisers.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="w-9 h-9 shrink-0 rounded-xl bg-[#E9EFFE] border border-[#C9D8FC] text-[#2F5BEA] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-charcoal-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-charcoal-600 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="fi-section fi-section--subtle">
        <div className="fi-shell">
          <div className="fi-cta-banner">
            <div className="max-w-2xl mx-auto space-y-6 relative z-10">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-[#A8C0FF]">
                <Sparkles className="w-3.5 h-3.5" />
                Everyone is welcome
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Walk with us in faith.
              </h2>
              <p className="text-base text-charcoal-200">
                Experience the difference of a community built around God&apos;s Word and genuine
                prayer.
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
