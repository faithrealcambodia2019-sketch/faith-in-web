import type { Metadata } from "next";
import { site } from "@/lib/site-content";
import { EmailContactForm } from "@/components/marketing/EmailContactForm";
import {
  Mail,
  MessageSquare,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: `Contact & Support — ${site.name}`,
  description:
    "Get in touch with the Faith In team for general questions, support, church partnerships, testimony submissions, or feedback.",
};

export default function ContactPage() {
  return (
    <div className="fi-page">
      {/* Hero */}
      <section className="fi-hero pb-12">
        <div className="fi-shell text-center max-w-3xl mx-auto space-y-4">
          <span className="fi-eyebrow">Contact Us • ទំនាក់ទំនង</span>
          <h1 className="text-4xl sm:text-5xl font-black text-charcoal-900 tracking-tight leading-tight">
            We would love to hear from <span className="fi-hero-highlight">you.</span>
          </h1>
          <p className="text-lg text-charcoal-600 leading-relaxed">
            Have a question about Faith In, need help with your account, or want to explore a church partnership? Send us a message and our team will get back to you promptly.
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="fi-section fi-section--subtle">
        <div className="fi-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Contact Channels Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-charcoal-900">
                  Direct Inquiries
                </h2>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  Reach out directly through our dedicated channels for pastors, members, and seekers.
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href={`mailto:${site.contactEmail}`}
                  className="fi-card p-5 flex items-start gap-4 hover:border-[#D9941E] transition-all group block text-inherit no-underline"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FEF7E6] text-[#B87814] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-charcoal-400">
                      General &amp; Partnerships
                    </div>
                    <div className="text-base font-bold text-charcoal-900 group-hover:text-[#D9941E] transition-colors">
                      {site.contactEmail}
                    </div>
                    <div className="text-xs text-charcoal-500 mt-0.5">
                      General questions and partnerships
                    </div>
                  </div>
                </a>

                <a
                  href={`mailto:${site.supportEmail}`}
                  className="fi-card p-5 flex items-start gap-4 hover:border-[#2563EB] transition-all group block text-inherit no-underline"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-charcoal-400">
                      Technical &amp; Member Support
                    </div>
                    <div className="text-base font-bold text-charcoal-900 group-hover:text-[#2563EB] transition-colors">
                      {site.supportEmail}
                    </div>
                    <div className="text-xs text-charcoal-500 mt-0.5">
                      Account assistance &amp; feedback
                    </div>
                  </div>
                </a>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#EAE7DC] space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-charcoal-700">
                  <Clock className="w-4 h-4 text-[#D9941E]" />
                  <span>Support Hours</span>
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Email is the most reliable way to reach the team. Your email app will let you review every message before sending.
                </p>
              </div>
            </div>

            {/* Interactive Contact Form */}
            <div className="lg:col-span-7 bg-white border border-[#EAE7DC] rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-charcoal-900">
                  Prepare an email to our team
                </h3>
                <p className="text-sm text-charcoal-600">
                  Fill out the form and your email app will open with a ready-to-review message.
                </p>
              </div>

              <EmailContactForm destination={site.contactEmail} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
