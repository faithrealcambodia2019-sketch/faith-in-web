"use client";

import { useState } from "react";
import Link from "next/link";
import { faithPersonas, FaithPersona } from "@/lib/site-content";
import { Sparkles, ArrowRight, CheckCircle } from "lucide-react";

export function PersonaSelector() {
  const [selectedId, setSelectedId] = useState<string>("seeker");

  const current: FaithPersona =
    faithPersonas.find((p) => p.id === selectedId) || faithPersonas[0];

  return (
    <div className="space-y-8">
      {/* 4 Persona Tab Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-[#F7F6F0] rounded-full border border-[#EAE7DC] max-w-2xl mx-auto">
        {faithPersonas.map((persona) => {
          const isSelected = selectedId === persona.id;
          return (
            <button
              key={persona.id}
              onClick={() => setSelectedId(persona.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                isSelected
                  ? "bg-white text-charcoal-900 shadow-xs font-bold border border-[#EAE7DC]"
                  : "text-charcoal-600 hover:text-charcoal-900"
              }`}
            >
              <span>{persona.stage}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Persona Detail Box */}
      <div className="bg-white border border-[#EAE7DC] rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B87814] bg-[#FEF7E6] px-3 py-1 rounded-full border border-[#FCE8BF]">
                {current.khmerStage}
              </span>
              <span className="text-xs text-charcoal-500 font-medium">Personalized Journey</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight leading-snug">
              {current.headline}
            </h3>

            <p className="text-base text-charcoal-600 leading-relaxed">
              {current.description}
            </p>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-charcoal-400">
                Recommended for you:
              </div>
              <div className="flex flex-wrap gap-2">
                {current.recommendedFeatures.map((feat) => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF9F5] border border-[#EAE7DC] rounded-full text-xs font-semibold text-charcoal-800"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-[#059669]" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Link href={current.href} className="fi-btn fi-btn--primary">
                <span>{current.callToAction}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Inspirational Visual Quote for Persona */}
          <div className="md:col-span-4 bg-gradient-to-br from-[#FEF7E6] to-[#FAF9F5] border border-[#FCE8BF] rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-white text-[#D9941E] flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-charcoal-900 text-sm">
                Safe & Reverent
              </h4>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                No judgment, no aggressive messaging, no commercial data collection. You are welcome to explore at your own pace.
              </p>
            </div>

            <div className="pt-2 border-t border-[#FCE8BF]/60 text-[11px] font-bold text-[#B87814]">
              FAITH IN COMPANION
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
