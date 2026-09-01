import { journeyStories, platformStats } from "@/lib/site-content";
import { ShieldCheck, Globe, Lock, Sparkles, ArrowRight } from "lucide-react";

export function TrustImpactSection() {
  return (
    <div className="space-y-16">
      {/* 4 Impact Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {platformStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-[#EAE7DC] rounded-3xl p-6 text-center shadow-sm space-y-1 hover:border-[#D9941E]/40 transition-colors"
          >
            <div className="text-3xl sm:text-4xl font-extrabold text-[#D9941E] tracking-tight">
              {stat.value}
            </div>
            <div className="text-sm font-bold text-charcoal-900">{stat.label}</div>
            <div className="text-xs text-charcoal-500">{stat.note}</div>
          </div>
        ))}
      </div>

      {/* Honest product stories: no invented member quotes or identities. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {journeyStories.map((story) => (
          <div
            key={story.audience}
            className="bg-white border border-[#EAE7DC] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B87814]">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>{story.audience}</span>
              </div>
              <p className="text-sm font-khmer text-charcoal-500">
                {story.khmerAudience}
              </p>
              <h3 className="text-xl font-extrabold text-charcoal-900">{story.title}</h3>
              <p className="text-sm text-charcoal-700 leading-relaxed">{story.description}</p>
            </div>

            <div className="pt-4 border-t border-[#EAE7DC] flex items-center justify-between gap-3 text-xs font-bold text-[#047857]">
              <span>{story.outcome}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>

      {/* Security & Reverence Sanctuary Banner */}
      <div className="bg-[#FAF9F5] border border-[#EAE7DC] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] border border-[#D1FAE5] text-[#059669] flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-extrabold text-charcoal-900">
              Our Privacy &amp; Respect Commitment
            </h4>
            <p className="text-xs sm:text-sm text-charcoal-600 max-w-xl leading-relaxed">
              Faith In is engineered as a clean digital sanctuary. We will never sell your information, serve commercial third-party ads, or use dark patterns. You can pray, read, and connect with total peace of mind.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE7DC] text-xs font-bold text-charcoal-700 shadow-xs">
            <Lock className="w-3.5 h-3.5 text-[#059669]" />
            <span>SSL Encrypted</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE7DC] text-xs font-bold text-charcoal-700 shadow-xs">
            <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Global Reach</span>
          </span>
        </div>
      </div>
    </div>
  );
}
