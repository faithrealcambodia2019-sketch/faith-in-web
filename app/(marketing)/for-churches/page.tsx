import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site-content";
import { EmailContactForm } from "@/components/marketing/EmailContactForm";
import {
  Users,
  ArrowRight,
  BookOpen,
  Radio,
} from "lucide-react";

export const metadata: Metadata = {
  title: `For Churches & Ministries — ${site.name}`,
  description:
    "Equip your church with modern digital discipleship tools, sermon media templates, coordinated prayer chains, and bilingual Scripture study tools.",
};

export default function ForChurchesPage() {
  return (
    <div className="fi-page">
      {/* Hero */}
      <section className="fi-hero pb-12">
        <div className="fi-shell text-center max-w-3xl mx-auto space-y-4">
          <span className="fi-eyebrow">Church Partnerships • សម្រាប់ក្រុមជំនុំ</span>
          <h1 className="text-4xl sm:text-5xl font-black text-charcoal-900 tracking-tight leading-tight">
            Digital discipleship tools for <span className="fi-hero-highlight">local churches.</span>
          </h1>
          <p className="text-lg text-charcoal-600 leading-relaxed">
            Empower your congregation throughout the week. Connect youth, families, and diaspora members through bilingual Scripture study, shared prayer chains, and uplifting media.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <a href="#partner-form" className="fi-btn fi-btn--primary">
              <span>Partner Your Church</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link href="/contact" className="fi-btn fi-btn--secondary">
              <span>Schedule a Call</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="fi-section fi-section--subtle">
        <div className="fi-shell">
          <div className="fi-head">
            <span className="fi-eyebrow">Ministry Toolkit • ឧបករណ៍បម្រើការ</span>
            <h2>How Faith In equips your congregation</h2>
            <p>
              Tools built to strengthen personal spiritual habits and foster authentic pastoral care beyond Sunday mornings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Tool 1 */}
            <div className="fi-card space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF7E6] border border-[#FCE8BF] text-[#B87814] flex items-center justify-center shadow-xs">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-charcoal-900">
                Congregation Prayer Chains
              </h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Mobilize intercession for sick members, missionary families, and community outreach with private or moderated prayer boards.
              </p>
            </div>

            {/* Tool 2 */}
            <div className="fi-card space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center shadow-xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-charcoal-900">
                Bilingual Youth Bible Study
              </h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Bridge language gaps between first-generation parents and diaspora youth with aligned Khmer and English parallel Scriptures.
              </p>
            </div>

            {/* Tool 3 */}
            <div className="fi-card space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] border border-[#D1FAE5] text-[#059669] flex items-center justify-center shadow-xs">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-charcoal-900">
                Sermon Audio &amp; Devotionals
              </h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Share short audio devotionals, pastor reflections, and weekly announcements with members directly through their mobile web app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Inquiry Form Section */}
      <section id="partner-form" className="fi-section">
        <div className="fi-shell">
          <div className="max-w-2xl mx-auto bg-white border border-[#EAE7DC] rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
            <div className="text-center space-y-2">
              <span className="fi-eyebrow">Get In Touch</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
                Connect your church with Faith In
              </h2>
              <p className="text-sm text-charcoal-600">
                Tell us about your ministry and prepare an email for the Faith In team.
              </p>
            </div>

            <EmailContactForm destination={site.contactEmail} variant="church" />
          </div>
        </div>
      </section>
    </div>
  );
}
