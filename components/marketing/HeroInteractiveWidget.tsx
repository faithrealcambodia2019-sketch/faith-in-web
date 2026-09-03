"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Headphones, Heart, Sparkles, Check, Play, Pause, Volume2, ArrowRight } from "lucide-react";
import { site } from "@/lib/site-content";

type Tab = "scripture" | "audio" | "prayer";

export function HeroInteractiveWidget() {
  const [activeTab, setActiveTab] = useState<Tab>("scripture");
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [prayedCount, setPrayedCount] = useState(48);
  const [hasPrayed, setHasPrayed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"both" | "km" | "en">("both");

  const handleCopy = () => {
    const text = `«ដ្បិតព្រះទ្រង់ស្រឡាញ់មនុស្សលោក ដល់ម៉្លេះបានជាទ្រង់ប្រទានព្រះរាជបុត្រាទ្រង់តែ១ ដើម្បីឲ្យអ្នកណាដែលជឿដល់ព្រះរាជបុត្រានោះ មិនត្រូវវិនាសឡើយ គឺឲ្យមានជីវិតអស់កល្បជានិច្ចវិញ» — យ៉ូហាន ៣:១៦

“For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.” — John 3:16`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrayer = () => {
    if (!hasPrayed) {
      setPrayedCount((prev) => prev + 1);
      setHasPrayed(true);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white border border-[#EAE7DC] rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Decorative Warm Top Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5C81F2] via-[#2F5BEA] to-[#1E40AF]" />

      {/* Widget Header & Navigation Tabs */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EAE7DC] gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-[#F7F6F0] rounded-full text-xs font-semibold text-charcoal-700">
          <button
            onClick={() => setActiveTab("scripture")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
              activeTab === "scripture"
                ? "bg-white text-charcoal-900 shadow-xs font-bold"
                : "hover:text-charcoal-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#2F5BEA]" />
            <span>Scripture</span>
          </button>

          <button
            onClick={() => setActiveTab("audio")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
              activeTab === "audio"
                ? "bg-white text-charcoal-900 shadow-xs font-bold"
                : "hover:text-charcoal-900"
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-[#2F5BEA]" />
            <span>Audio Blessing</span>
          </button>

          <button
            onClick={() => setActiveTab("prayer")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
              activeTab === "prayer"
                ? "bg-white text-charcoal-900 shadow-xs font-bold"
                : "hover:text-charcoal-900"
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-[#059669]" />
            <span>Prayer Wall</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Live</span>
        </div>
      </div>

      {/* TAB CONTENT 1: SCRIPTURE OF THE DAY */}
      {activeTab === "scripture" && (
        <div className="pt-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E40AF] bg-[#E9EFFE] px-2.5 py-0.5 rounded-full border border-[#C9D8FC]">
              Verse of the Day • ព្រះបន្ទូលប្រចាំថ្ងៃ
            </span>

            {/* Language switch toggle */}
            <div className="flex items-center gap-1 text-[11px] font-bold text-charcoal-600 bg-[#F7F6F0] p-0.5 rounded-lg">
              <button
                onClick={() => setSelectedLanguage("both")}
                className={`px-2 py-0.5 rounded ${selectedLanguage === "both" ? "bg-white shadow-xs text-charcoal-900" : ""}`}
              >
                Dual
              </button>
              <button
                onClick={() => setSelectedLanguage("km")}
                className={`px-2 py-0.5 rounded ${selectedLanguage === "km" ? "bg-white shadow-xs text-charcoal-900" : ""}`}
              >
                ខ្មែរ
              </button>
              <button
                onClick={() => setSelectedLanguage("en")}
                className={`px-2 py-0.5 rounded ${selectedLanguage === "en" ? "bg-white shadow-xs text-charcoal-900" : ""}`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DC]/80 space-y-3">
            {(selectedLanguage === "both" || selectedLanguage === "km") && (
              <p className="text-base text-charcoal-900 leading-relaxed font-khmer font-medium">
                «ដ្បិតព្រះទ្រង់ស្រឡាញ់មនុស្សលោក ដល់ម៉្លេះបានជាទ្រង់ប្រទានព្រះរាជបុត្រាទ្រង់តែ១ ដើម្បីឲ្យអ្នកណាដែលជឿដល់ព្រះរាជបុត្រានោះ មិនត្រូវវិនាសឡើយ គឺឲ្យមានជីវិតអស់កល្បជានិច្ចវិញ»
              </p>
            )}

            {(selectedLanguage === "both" || selectedLanguage === "en") && (
              <p className="text-sm text-charcoal-700 italic font-serif leading-relaxed border-t border-[#EAE7DC]/60 pt-2">
                &ldquo;For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.&rdquo;
              </p>
            )}

            <div className="flex items-center justify-between pt-1 text-xs font-bold text-[#1E40AF]">
              <span>យ៉ូហាន ៣:១៦ • JOHN 3:16</span>
              <span className="text-[11px] text-charcoal-400 font-normal">Khmer &amp; English</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 transition-colors px-3 py-1.5 rounded-full hover:bg-black/5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Sparkles className="w-3.5 h-3.5 text-[#2F5BEA]" />}
              <span>{copied ? "Copied to clipboard" : "Copy verse"}</span>
            </button>

            <Link
              href="/bible-study"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1E40AF] hover:underline"
            >
              <span>Design verse card</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: AUDIO BLESSINGS */}
      {activeTab === "audio" && (
        <div className="pt-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2F5BEA] bg-[#E9EFFE] px-2.5 py-0.5 rounded-full border border-[#C9D8FC]">
              Daily Spoken Blessing • សម្លេងព្រះពរ
            </span>
            <span className="text-xs text-charcoal-500 font-medium">1:45 min devotion</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F8FAFC] to-[#E9EFFE]/60 border border-[#C9D8FC] space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-2xl bg-[#2F5BEA] hover:bg-[#1E40AF] text-white flex items-center justify-center shadow-md transition-all group shrink-0"
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-charcoal-900 truncate">
                  Peaceful Morning Grace (សេចក្ដីសុខសាន្ត)
                </div>
                <div className="text-xs text-charcoal-500 flex items-center gap-1.5 mt-0.5">
                  <Volume2 className="w-3.5 h-3.5 text-[#2F5BEA]" />
                  <span>Calm spoken Scripture with acoustic cello</span>
                </div>
              </div>
            </div>

            {/* Audio waveform simulator */}
            <div className="flex items-center gap-1 h-8 px-2 bg-white/80 rounded-xl border border-[#C9D8FC]">
              {[40, 65, 80, 45, 90, 70, 50, 85, 95, 60, 40, 75, 85, 60, 30, 55, 70, 85, 40, 60, 75].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    isPlaying ? "bg-[#2F5BEA]" : "bg-charcoal-200"
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(20, (h * (i % 3 + 1)) % 100)}%` : `${h * 0.4}%`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-charcoal-500 font-medium">
              10+ High-definition daily devotionals
            </span>

            <Link
              href={site.appPath}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#2F5BEA] hover:underline"
            >
              <span>Listen in app</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: PRAYER WALL */}
      {activeTab === "prayer" && (
        <div className="pt-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#059669] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#D1FAE5]">
              Community Prayer Wall • សេចក្តីអធិស្ឋាន
            </span>
            <span className="text-xs text-charcoal-500 font-medium">10 mins ago</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DC] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                KP
              </div>
              <div>
                <span className="text-xs font-bold text-charcoal-900">Kalyan & Family</span>
                <span className="text-[11px] text-charcoal-400 ml-1.5">• Siem Reap</span>
              </div>
            </div>

            <p className="text-sm text-charcoal-800 leading-relaxed font-khmer">
              សូមបងប្អូនជួយអធិស្ឋានសម្រាប់សុខភាពម្តាយខ្ញុំដែលកំពុងសម្រាកព្យាបាលនៅមន្ទីរពេទ្យ សូមព្រះប្រទានការព្យាបាល និងកម្លាំងចិត្តដល់គាត់។
            </p>
            <p className="text-xs text-charcoal-600 italic">
              &ldquo;Please pray for my mother recovering in hospital. Praying for God&apos;s healing peace.&rdquo;
            </p>

            <div className="pt-2 border-t border-[#EAE7DC] flex items-center justify-between">
              <button
                onClick={handlePrayer}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  hasPrayed
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${hasPrayed ? "fill-white" : ""}`} />
                <span>{hasPrayed ? "Prayed!" : "Pray for this"}</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/10 text-[10px]">
                  {prayedCount}
                </span>
              </button>

              <span className="text-xs text-charcoal-500 font-medium">12 encouraging comments</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-charcoal-500 font-medium">
              Anonymous posting available
            </span>

            <Link
              href={site.appPath}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#059669] hover:underline"
            >
              <span>Submit a prayer request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
