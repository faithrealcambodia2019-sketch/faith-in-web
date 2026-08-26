import type { Metadata } from "next";
import { site } from "@/lib/site-content";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: `Privacy Policy — ${site.name}`,
  description:
    "Our privacy policy explains how Faith In protects your spiritual journey, respects your data, and maintains an ad-free, secure Christian sanctuary.",
};

export default function PrivacyPage() {
  return (
    <div className="fi-page">
      <section className="fi-hero pb-8">
        <div className="fi-shell fi-shell--narrow text-center space-y-3">
          <span className="fi-eyebrow">Privacy &amp; Security</span>
          <h1 className="text-4xl sm:text-5xl font-black text-charcoal-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-charcoal-500">
            Last revised: August 2026 • Effective immediately
          </p>
        </div>
      </section>

      <section className="fi-section pt-0">
        <div className="fi-shell fi-shell--narrow space-y-8">
          {/* Summary Callout Banner */}
          <div className="bg-[#FEF7E6] border border-[#FCE8BF] rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#B87814]">
              <ShieldCheck className="w-5 h-5 text-[#D9941E]" />
              <span>Plain Language Summary</span>
            </div>
            <p className="text-sm text-charcoal-800 leading-relaxed">
              Faith In is engineered as a spiritual sanctuary. We will never sell your personal data, we do not run third-party advertising networks, and we support fully anonymous prayer requests so you can share burdens in complete confidence.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-charcoal-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Third-Party Ads</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-charcoal-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Encrypted in Transit</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-charcoal-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Anonymous Prayer Mode</span>
              </div>
            </div>
          </div>

          {/* Policy Body */}
          <div className="bg-white border border-[#EAE7DC] rounded-3xl p-8 sm:p-12 space-y-8 text-charcoal-700 leading-relaxed text-sm">
            <div className="space-y-3">
              <h2 className="text-xl font-extrabold text-charcoal-900">
                1. Information We Collect
              </h2>
              <p>
                When you create an account on Faith In, we collect minimal profile details necessary to operate your fellowship account: your name, email address, optional profile photo, and password hash (managed securely through Firebase Authentication).
              </p>
              <p>
                When you use the app, you may post prayer requests, testimonies, audio blessings, or comments. Content you choose to mark as &ldquo;Anonymous&rdquo; is stripped of public identifiers on our community feeds.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-extrabold text-charcoal-900">
                2. How We Use Your Information
              </h2>
              <p>
                We use collected information exclusively to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Authenticate your account and sync your Scripture bookmarks across devices.</li>
                <li>Deliver community feeds, prayer requests, and audio devotionals.</li>
                <li>Prevent abusive content, spam, and unauthorized account access.</li>
                <li>Send important service updates or direct replies to your support requests.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-extrabold text-charcoal-900">
                3. What We Never Do
              </h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>We never sell, rent, or monetize your personal data.</li>
                <li>We never share your prayer requests with advertising brokers.</li>
                <li>We never embed tracking pixels from third-party social ad platforms.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-extrabold text-charcoal-900">
                4. Data Retention &amp; Deletion
              </h2>
              <p>
                You maintain complete ownership of your content. You can edit, delete your posts, or permanently delete your Faith In account at any time. Upon account deletion, your personal records are purged from our active databases.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-extrabold text-charcoal-900">
                5. Contacting Us
              </h2>
              <p>
                If you have questions regarding this Privacy Policy or your personal information, please email us at{" "}
                <a href={`mailto:${site.contactEmail}`} className="text-[#D9941E] font-bold hover:underline">
                  {site.contactEmail}
                </a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
