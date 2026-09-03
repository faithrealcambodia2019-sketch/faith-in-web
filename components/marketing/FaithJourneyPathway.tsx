"use client";

import { useState } from "react";
import Link from "next/link";
import { journeyPathway, JourneyStep } from "@/lib/site-content";
import { Compass, Headphones, Users, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export function FaithJourneyPathway() {
  const [selectedStep, setSelectedStep] = useState<number>(0);

  const getIcon = (icon: string) => {
    switch (icon) {
      case "compass":
        return <Compass className="w-6 h-6 text-[#2F5BEA]" />;
      case "headphones":
        return <Headphones className="w-6 h-6 text-[#2F5BEA]" />;
      case "users":
        return <Users className="w-6 h-6 text-[#059669]" />;
      case "sparkles":
      default:
        return <Sparkles className="w-6 h-6 text-[#2F5BEA]" />;
    }
  };

  const current: JourneyStep = journeyPathway[selectedStep];

  return (
    <div className="space-y-10">
      {/* 4 Step Selector Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {journeyPathway.map((item, index) => {
          const isSelected = selectedStep === index;
          return (
            <button
              key={item.step}
              onClick={() => setSelectedStep(index)}
              className={`p-4 md:p-5 rounded-2xl text-left border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? "bg-white border-[#2F5BEA] shadow-md ring-2 ring-[#2F5BEA]/20"
                  : "bg-white/70 hover:bg-white border-[#EAE7DC] hover:border-[#D6D2C2] shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-3 w-full">
                <span
                  className={`text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-[#E9EFFE] text-[#1E40AF] border border-[#C9D8FC]"
                      : "bg-[#F7F6F0] text-charcoal-500"
                  }`}
                >
                  Step {item.number}
                </span>

                <div className="p-1.5 rounded-xl bg-[#FAF9F5]">
                  {getIcon(item.icon)}
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-base md:text-lg text-charcoal-900 leading-tight">
                  {item.step}
                </h3>
                <div className="text-xs font-khmer text-charcoal-500 mt-0.5">
                  {item.khmerTitle}
                </div>
              </div>

              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5C81F2] to-[#2F5BEA]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Step Feature Showcase Card */}
      <div className="bg-white border border-[#EAE7DC] rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9EFFE] border border-[#C9D8FC] text-xs font-bold text-[#1E40AF]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step {current.number} • {current.highlight}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal-900 leading-tight">
              {current.title}
            </h3>

            <p className="text-base sm:text-lg text-charcoal-600 leading-relaxed">
              {current.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href={current.actionHref}
                className="fi-btn fi-btn--primary"
              >
                <span>{current.actionText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Bilingual Khmer & English</span>
              </div>
            </div>
          </div>

          {/* Interactive visual mockup side */}
          <div className="lg:col-span-5 bg-[#FAF9F5] border border-[#EAE7DC] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE7DC] pb-3">
              <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">
                Experience Preview
              </span>
              <span className="text-xs font-bold text-[#2F5BEA] bg-[#E9EFFE] px-2 py-0.5 rounded">
                {current.step} Experience
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-white rounded-xl border border-[#EAE7DC] shadow-xs">
                <div className="text-xs font-bold text-charcoal-900 mb-1">
                  {current.highlight}
                </div>
                <div className="text-xs text-charcoal-600 line-clamp-2">
                  {current.description}
                </div>
              </div>

              <div className="p-3 bg-white/70 rounded-xl border border-dashed border-[#EAE7DC] flex items-center justify-between text-xs text-charcoal-500">
                <span>Free & Accessible to all seekers</span>
                <span className="font-bold text-emerald-600">Available Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
