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
                  className="bg-[#F0F2F5] rounded-[24px] p-5 sm:p-6 hover:bg-[#E4E6EB] transition-colors cursor-pointer group flex items-start gap-4 border-0 shadow-none text-inherit no-underline"
                >
                  <div className="bg-white rounded-xl p-3 shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0">
                    <Mail className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      General &amp; Partnerships
                    </div>
                    <div className="text-base font-extrabold text-charcoal-900 group-hover:text-blue-700 transition-colors">
                      {site.contactEmail}
                    </div>
                    <div className="text-xs text-charcoal-600 mt-0.5">
                      General questions and partnerships
                    </div>
                  </div>
                </a>

                <a
                  href={`mailto:${site.supportEmail}`}
                  className="bg-[#F0F2F5] rounded-[24px] p-5 sm:p-6 hover:bg-[#E4E6EB] transition-colors cursor-pointer group flex items-start gap-4 border-0 shadow-none text-inherit no-underline"
                >
                  <div className="bg-white rounded-xl p-3 shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0">
                    <MessageSquare className="w-6 h-6 text-teal-600" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-teal-700">
                      Technical &amp; Member Support
                    </div>
                    <div className="text-base font-extrabold text-charcoal-900 group-hover:text-teal-700 transition-colors">
                      {site.supportEmail}
                    </div>
                    <div className="text-xs text-charcoal-600 mt-0.5">
                      Account assistance &amp; feedback
                    </div>
                  </div>
                </a>
              </div>

              <div className="p-6 rounded-[24px] bg-[#F0F2F5] border-0 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-charcoal-800">
                  <Clock className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                  <span>Support Hours</span>
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Email is the most reliable way to reach the team. Your email app will let you review every message before sending.
                </p>
              </div>
            </div>

            {/* Interactive Contact Form */}
            <div className="lg:col-span-7 bg-[#F0F2F5] rounded-[28px] p-6 sm:p-10 border-0 space-y-6">
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
