import type { Metadata } from "next";
import { site } from "@/lib/site-content";
import { ShieldCheck, Lock, EyeOff, Ban, Mail, CalendarDays } from "lucide-react";

export const metadata: Metadata = {
  title: `Privacy Policy — ${site.name}`,
  description:
    "Our privacy policy explains how Faith In protects your spiritual journey, respects your data, and maintains an ad-free, secure Christian sanctuary.",
};

const sections = [
  { id: "information-we-collect", label: "Information we collect" },
  { id: "how-we-use-it", label: "How we use your information" },
  { id: "what-we-never-do", label: "What we never do" },
  { id: "retention-and-deletion", label: "Data retention & deletion" },
  { id: "contacting-us", label: "Contacting us" },
];

/** A gold numeral in a soft disc, so each section reads as a step. */
function SectionNumber({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="shrink-0 w-9 h-9 rounded-full bg-brand-100 border border-brand-200 text-brand-600 font-extrabold text-[15px] grid place-items-center"
    >
      {n}
    </span>
  );
}

function SectionHeading({ n, id, children }: { n: number; id: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5">
      <SectionNumber n={n} />
      <h2 id={id} className="scroll-mt-28 text-[22px] font-extrabold text-charcoal-900 tracking-tight">
        {children}
      </h2>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="fi-page">
      <section className="fi-hero pb-6">
        <div className="fi-shell fi-shell--narrow text-center space-y-4">
          <span className="fi-eyebrow">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            Privacy &amp; Security
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-charcoal-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mx-auto max-w-[46ch] text-[15px] text-charcoal-500 leading-relaxed">
            How Faith In handles what you share — written plainly, so you can read it
            once and know where you stand.
          </p>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#EAE7DC] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-charcoal-500">
            <CalendarDays className="w-3.5 h-3.5 text-brand-500" aria-hidden="true" />
            Last revised August 2026 · Effective immediately
          </p>
        </div>
      </section>

      <section className="fi-section pt-4">
        <div className="fi-shell">
          <div className="grid gap-10 lg:gap-14 lg:grid-cols-[210px_minmax(0,1fr)]">
            {/* On this page — a policy long enough to need a map gets one */}
            <aside className="hidden lg:block">
              <nav aria-label="On this page" className="sticky top-28">
                <p className="text-[11.5px] font-extrabold uppercase tracking-[0.09em] text-charcoal-400 mb-3">
                  On this page
                </p>
                <ul className="space-y-1 border-l border-[#EAE7DC]">
                  {sections.map((section, index) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block -ml-px border-l-2 border-transparent pl-4 py-1.5 text-[13.5px] leading-snug text-charcoal-500 transition hover:border-brand-400 hover:text-charcoal-900"
                      >
                        <span className="text-brand-600 font-bold mr-1.5">{index + 1}.</span>
                        {section.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <div className="min-w-0 space-y-8">
              {/* Plain language summary */}
              <div className="rounded-3xl border border-brand-200 bg-gradient-to-b from-brand-50 to-white p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-2 text-[13.5px] font-extrabold uppercase tracking-[0.08em] text-brand-600">
                  <ShieldCheck className="w-[18px] h-[18px] text-brand-500" aria-hidden="true" />
                  Plain language summary
                </div>
                <p className="text-[15.5px] text-charcoal-800 leading-relaxed max-w-[62ch]">
                  Faith In is engineered as a spiritual sanctuary. We will never sell your
                  personal data, we do not run third-party advertising networks, and we
                  support fully anonymous prayer requests so you can share burdens in
                  complete confidence.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {[
                    { icon: Ban, label: "Zero third-party ads" },
                    { icon: Lock, label: "Encrypted in transit" },
                    { icon: EyeOff, label: "Anonymous prayer mode" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2.5 rounded-2xl border border-brand-200/70 bg-white/70 px-3.5 py-3"
                    >
                      <Icon className="w-4 h-4 text-brand-500 shrink-0" aria-hidden="true" />
                      <span className="text-[13px] font-bold text-charcoal-800 leading-snug">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policy body */}
              <div className="bg-white border border-[#EAE7DC] rounded-3xl p-7 sm:p-11 space-y-11 text-charcoal-700 leading-relaxed text-[15.5px]">
                <div className="space-y-4">
                  <SectionHeading n={1} id="information-we-collect">
                    Information we collect
                  </SectionHeading>
                  <div className="space-y-3.5 sm:pl-[50px] max-w-[68ch]">
                    <p>
                      When you create an account on Faith In, we collect minimal profile details
                      necessary to operate your fellowship account: your name, email address,
                      optional profile photo, and password hash (managed securely through Firebase
                      Authentication).
                    </p>
                    <p>
                      When you use the app, you may post prayer requests, testimonies, audio
                      blessings, or comments. Content you choose to mark as &ldquo;Anonymous&rdquo;
                      is stripped of public identifiers on our community feeds.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionHeading n={2} id="how-we-use-it">
                    How we use your information
                  </SectionHeading>
                  <div className="space-y-3.5 sm:pl-[50px] max-w-[68ch]">
                    <p>We use collected information exclusively to:</p>
                    <ul className="space-y-2.5">
                      {[
                        "Authenticate your account and sync your Scripture bookmarks across devices.",
                        "Deliver community feeds, prayer requests, and audio devotionals.",
                        "Prevent abusive content, spam, and unauthorized account access.",
                        "Send important service updates or direct replies to your support requests.",
                      ].map((item) => (
                        <li key={item} className="flex gap-3">
                          <span
                            aria-hidden="true"
                            className="mt-[9px] w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* The strongest promise on the page, set apart so it reads that way */}
                <div className="space-y-4">
                  <SectionHeading n={3} id="what-we-never-do">
                    What we never do
                  </SectionHeading>
                  <div className="sm:ml-[50px] rounded-2xl border border-[#EAE7DC] bg-[#FBFAF7] p-5 sm:p-6 max-w-[68ch]">
                    <ul className="space-y-3.5">
                      {[
                        "We never sell, rent, or monetize your personal data.",
                        "We never share your prayer requests with advertising brokers.",
                        "We never embed tracking pixels from third-party social ad platforms.",
                      ].map((item) => (
                        <li key={item} className="flex gap-3 items-start">
                          <Ban className="w-[18px] h-[18px] text-brand-500 shrink-0 mt-0.5" aria-hidden="true" />
                          <span className="font-semibold text-charcoal-800">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionHeading n={4} id="retention-and-deletion">
                    Data retention &amp; deletion
                  </SectionHeading>
                  <div className="space-y-3.5 sm:pl-[50px] max-w-[68ch]">
                    <p>
                      You maintain complete ownership of your content. You can edit, delete your
                      posts, or permanently delete your Faith In account at any time. Upon account
                      deletion, your personal records are purged from our active databases.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionHeading n={5} id="contacting-us">
                    Contacting us
                  </SectionHeading>
                  <div className="sm:ml-[50px] max-w-[68ch]">
                    <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                      <p className="text-[15px] text-charcoal-800 leading-relaxed max-w-[42ch]">
                        Questions about this policy, or about your own information? Write to us and
                        a person will answer.
                      </p>
                      <a
                        href={`mailto:${site.contactEmail}`}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-[14px] font-bold text-white shadow-sm transition hover:bg-brand-600 shrink-0"
                      >
                        <Mail className="w-4 h-4" aria-hidden="true" />
                        {site.contactEmail}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
