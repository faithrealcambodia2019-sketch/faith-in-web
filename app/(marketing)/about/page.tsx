import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site-content";
import {
  ArrowRight,
  BookOpen,
  Globe,
  Shield,
  Heart,
  CheckCircle2,
  Users,
  Target,
  Zap,
  MapPin,
  Mail,
  Building,
} from "lucide-react";

export const metadata: Metadata = {
  title: `About Us & Mission — ${site.name}`,
  description: "Learn about Faith In: our mission, our values, and our commitment to building a premier digital sanctuary for the global Church.",
};

const stats = [
  { label: "Founded", value: "2019" },
  { label: "Languages", value: "Khmer & English" },
  { label: "Pricing", value: "100% Free" },
  { label: "Ads", value: "Zero" },
];

const values = [
  {
    icon: BookOpen,
    title: "Biblically Grounded",
    description: "Every feature and community guideline is rooted in the authority of Scripture and historic Christian orthodoxy.",
  },
  {
    icon: Globe,
    title: "Global Diaspora",
    description: "Connecting believers across borders, from Southeast Asia to the US, Europe, and Australia.",
  },
  {
    icon: Shield,
    title: "Data Privacy",
    description: "We never sell user data, track for advertising, or employ manipulative algorithms.",
  },
  {
    icon: Target,
    title: "Mission-Driven",
    description: "Our primary metric of success is spiritual growth, not screen time or daily active users.",
  },
];

const beliefs = [
  {
    title: "The Triune God",
    description: "We believe in one God, eternally existing in three distinct persons: Father, Son, and Holy Spirit.",
  },
  {
    title: "Authority of Scripture",
    description: "The 66 books of the Bible are the inspired, infallible, and authoritative Word of God.",
  },
  {
    title: "Salvation by Grace",
    description: "Salvation is a free gift from God, received through faith alone in Jesus Christ.",
  },
  {
    title: "The Church",
    description: "We are called to proclaim the Gospel, make disciples, and live in holiness.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#050505] font-sans selection:bg-[#E9EFFE] selection:text-[#2F5BEA]">

      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 pb-10 lg:pt-16 lg:pb-12 bg-white border-b border-[#DADDE1]">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E4E6EB] text-[#65676B] text-xs font-semibold tracking-wide uppercase mb-6">
              <Building className="w-3.5 h-3.5" />
              <span>About Faith In</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#050505] leading-tight">
              Building a Digital Sanctuary for the Global Church.
            </h1>
            <p className="mt-4 text-[15px] text-[#65676B] leading-relaxed max-w-2xl">
              Faith In is a premium, bilingual platform engineered to foster deep spiritual growth, reverent Scripture study, and authentic community for Khmer and English speakers worldwide.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={site.appPath} className="inline-flex items-center justify-center gap-2 px-4 h-9 rounded-md bg-[#2F5BEA] text-white text-[15px] font-semibold hover:bg-[#2549C9] transition-colors">
                <span>View Platform</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-4 h-9 rounded-md bg-[#E4E6EB] text-[#050505] text-[15px] font-semibold hover:brightness-95 transition-all">
                <span>Contact Ministry</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- METRICS / STATS --- */}
      <section className="pt-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#CED0D4] bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.2)] overflow-hidden">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-6 text-center">
                <div className="text-2xl font-bold text-[#050505]">{stat.value}</div>
                <div className="mt-1 text-[13px] font-medium text-[#65676B] uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MISSION / VISION --- */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.2)] p-6">
              <h2 className="text-xl font-bold tracking-tight text-[#050505]">Our Mission</h2>
              <p className="mt-3 text-[15px] text-[#65676B] leading-relaxed">
                In an era dominated by noisy algorithms and commercialized social media, believers lack a dedicated space for quiet reflection and meaningful fellowship.
              </p>
              <p className="mt-3 text-[15px] text-[#65676B] leading-relaxed">
                Our mission is to provide a meticulously designed, distraction-free environment where the Word of God is central, and community interactions are marked by grace and truth.
              </p>

              <div className="mt-6 p-4 bg-[#F0F2F5] rounded-lg">
                <h3 className="text-[15px] font-semibold text-[#050505] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#2F5BEA]" />
                  Bilingual Integration
                </h3>
                <p className="mt-2 text-[13px] text-[#65676B] leading-relaxed">
                  We seamlessly bridge Khmer and English, ensuring that language is never a barrier to accessing high-quality theological resources or connecting with the global body of Christ.
                </p>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-lg p-6 shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                <div className="w-12 h-12 bg-[#2F5BEA] text-white rounded-lg flex items-center justify-center font-bold text-xl mb-5">FI</div>
                <h3 className="text-lg font-bold text-[#050505] mb-2">The Foundation Verse</h3>
                <blockquote className="text-[17px] italic text-[#050505] leading-relaxed">
                  &ldquo;For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.&rdquo;
                </blockquote>
                <div className="mt-4 text-[13px] font-semibold text-[#2F5BEA] uppercase tracking-wide">
                  John 3:16 • យ៉ូហាន ៣:១៦
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CORE VALUES --- */}
      <section className="pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-[#050505]">Core Principles</h2>
            <p className="mt-2 text-[15px] text-[#65676B] max-w-2xl">
              The operational and philosophical guidelines that dictate how we build features and manage our community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="bg-white p-5 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                  <div className="w-10 h-10 rounded-full bg-[#E9EFFE] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#2F5BEA]" />
                  </div>
                  <h3 className="text-[15px] font-bold text-[#050505]">{val.title}</h3>
                  <p className="mt-2 text-[13px] text-[#65676B] leading-relaxed">{val.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- STATEMENT OF FAITH --- */}
      <section className="pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-4">
              <h2 className="text-xl font-bold tracking-tight text-[#050505]">Statement of Faith</h2>
              <p className="mt-2 text-[15px] text-[#65676B]">
                We stand firmly within the stream of historic Christian orthodoxy, holding to the essential truths of the biblical Gospel.
              </p>
            </div>
            <div className="md:col-span-8">
              <div className="bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.2)] px-6 divide-y divide-[#CED0D4]">
                {beliefs.map((belief, idx) => (
                  <div key={idx} className="py-5">
                    <h3 className="text-[15px] font-bold text-[#050505] flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#2F5BEA]" />
                      {belief.title}
                    </h3>
                    <p className="mt-2 text-[13px] text-[#65676B] leading-relaxed pl-8">{belief.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.2)] px-6 py-10 text-center">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#050505]">Partner with our Ministry</h2>
            <p className="mt-3 text-[15px] text-[#65676B] max-w-2xl mx-auto">
              Whether you are a church leader looking for digital discipleship tools, or a believer seeking a reverent online community, we invite you to join us.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/contact" className="inline-flex items-center justify-center px-4 h-9 rounded-md bg-[#E4E6EB] text-[#050505] text-[15px] font-semibold hover:brightness-95 transition-all">
                Contact Us
              </Link>
              <Link href={site.appPath} className="inline-flex items-center justify-center px-4 h-9 rounded-md bg-[#2F5BEA] text-white text-[15px] font-semibold hover:bg-[#2549C9] transition-colors">
                Open App
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
