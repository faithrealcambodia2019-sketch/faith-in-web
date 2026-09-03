import type { Metadata } from "next";
import { site } from "@/lib/site-content";
import { HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: `Terms of Service — ${site.name}`,
  description:
    "Terms of service for Faith In: community guidelines, respectful Christian fellowship standards, and usage conditions.",
};

export default function TermsPage() {
  return (
    <div className="fi-page">
      <section className="fi-hero pb-8">
        <div className="fi-shell fi-shell--narrow text-center space-y-3">
          <span className="fi-eyebrow">Terms &amp; Community Standards</span>
          <h1 className="text-4xl sm:text-5xl font-black text-charcoal-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-charcoal-500">
            Last revised: August 2026 • Effective immediately
          </p>
        </div>
      </section>

      <section className="fi-section pt-0">
        <div className="fi-shell fi-shell--narrow space-y-8">
          {/* Summary Callout */}
          <div className="bg-[#FAF9F5] border border-[#EAE7DC] rounded-3xl p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-charcoal-900">
              <HeartHandshake className="w-5 h-5 text-[#2F5BEA]" />
              <span>Sanctuary Covenant</span>
            </div>
            <p className="text-sm text-charcoal-700 leading-relaxed">
              By using Faith In, you agree to treat fellow members and seekers with Christ-like kindness, respect, and grace. We maintain active moderation to ensure our platform remains an uplifting environment for all.
            </p>
          </div>

          {/* Terms Content */}
          <div className="bg-white border border-[#EAE7DC] rounded-3xl p-8 sm:p-12 space-y-8 text-charcoal-700 leading-relaxed text-sm">
            <div className="space-y-3">
              <h2 className="text-xl font-extrabold text-charcoal-900">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using {site.name} ({site.domain}), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-extrabold text-charcoal-900">
                2. Community Fellowship Guidelines
              </h2>
              <p>
                Faith In is designed as a peaceful platform centered on God&apos;s Word. You agree not to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Post abusive, harassing, defamatory, or threatening messages.</li>
                <li>Engage in political hostility, commercial spam, or fraudulent solicitations.</li>
                <li>Impersonate church leaders, ministries, or other individuals.</li>
                <li>Violate copyright or intellectual property rights of Scripture translations or media creators.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-extrabold text-charcoal-900">
                3. User Content &amp; Moderation
              </h2>
              <p>
                You retain ownership of the content you publish on Faith In. We reserve the right, at our discretion, to remove content or suspend accounts that violate our community standards or create harm in the fellowship.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-extrabold text-charcoal-900">
                4. Free Service Disclaimer
              </h2>
              <p>
                Faith In is provided free of charge on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis. We strive for 99.9% uptime, data security, and seamless performance, but cannot guarantee uninterrupted availability during emergency maintenance.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-extrabold text-charcoal-900">
                5. Contact
              </h2>
              <p>
                For questions concerning these terms, reach us at{" "}
                <a href={`mailto:${site.contactEmail}`} className="text-[#2F5BEA] font-bold hover:underline">
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
