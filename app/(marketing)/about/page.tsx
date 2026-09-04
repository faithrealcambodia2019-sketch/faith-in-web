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
    <div className="min-h-screen bg-white text-blue-950 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 bg-blue-900 border-b border-blue-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/50 border border-blue-700 text-blue-100 text-xs font-semibold tracking-wide uppercase mb-6">
              <Building className="w-3.5 h-3.5" />
              <span>About Faith In</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Building a Digital Sanctuary for the Global Church.
            </h1>
            <p className="mt-6 text-lg text-blue-100 leading-relaxed max-w-2xl">
              Faith In is a premium, bilingual platform engineered to foster deep spiritual growth, reverent Scripture study, and authentic community for Khmer and English speakers worldwide.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href={site.appPath} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-blue-900 font-semibold hover:bg-blue-50 transition-colors shadow-sm">
                <span>View Platform</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-800 border border-blue-700 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                <span>Contact Ministry</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- METRICS / STATS --- */}
      <section className="border-b border-blue-800 bg-blue-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-blue-800/60 border-x border-blue-800/60">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-8 text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-sm font-medium text-blue-200 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MISSION / VISION --- */}
      <section className="py-24 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-blue-950">Our Mission</h2>
              <p className="mt-4 text-blue-900/80 leading-relaxed">
                In an era dominated by noisy algorithms and commercialized social media, believers lack a dedicated space for quiet reflection and meaningful fellowship. 
              </p>
              <p className="mt-4 text-blue-900/80 leading-relaxed">
                Our mission is to provide a meticulously designed, distraction-free environment where the Word of God is central, and community interactions are marked by grace and truth.
              </p>
              
              <div className="mt-8 p-6 bg-blue-50/50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-blue-950 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  Bilingual Integration
                </h3>
                <p className="mt-2 text-sm text-blue-900/80">
                  We seamlessly bridge Khmer and English, ensuring that language is never a barrier to accessing high-quality theological resources or connecting with the global body of Christ.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-blue-50 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
              <div className="bg-white border border-blue-200 rounded-3xl p-8 shadow-xl">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl mb-6">FI</div>
                <h3 className="text-xl font-bold text-blue-950 mb-2">The Foundation Verse</h3>
                <blockquote className="text-lg italic text-blue-900 leading-relaxed">
                  "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life."
                </blockquote>
                <div className="mt-4 text-sm font-semibold text-blue-600 uppercase tracking-wide">
                  John 3:16 • យ៉ូហាន ៣:១៦
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CORE VALUES --- */}
      <section className="py-24 bg-blue-50/50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-blue-950">Core Principles</h2>
            <p className="mt-4 text-lg text-blue-900/80 max-w-2xl">
              The operational and philosophical guidelines that dictate how we build features and manage our community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-950">{val.title}</h3>
                  <p className="mt-2 text-sm text-blue-900/80 leading-relaxed">{val.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- STATEMENT OF FAITH --- */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <h2 className="text-3xl font-bold tracking-tight text-blue-950">Statement of Faith</h2>
              <p className="mt-4 text-blue-900/80">
                We stand firmly within the stream of historic Christian orthodoxy, holding to the essential truths of the biblical Gospel.
              </p>
            </div>
            <div className="md:col-span-8">
              <div className="divide-y divide-blue-100">
                {beliefs.map((belief, idx) => (
                  <div key={idx} className="py-6 first:pt-0 last:pb-0">
                    <h3 className="text-lg font-bold text-blue-950 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      {belief.title}
                    </h3>
                    <p className="mt-2 text-blue-900/80 pl-8">{belief.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 bg-blue-950 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Partner with our Ministry</h2>
          <p className="mt-6 text-lg text-blue-200">
            Whether you are a church leader looking for digital discipleship tools, or a believer seeking a reverent online community, we invite you to join us.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-blue-950 font-semibold hover:bg-blue-100 transition-colors">
              Contact Us
            </Link>
            <Link href={site.appPath} className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors">
              Open App
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
