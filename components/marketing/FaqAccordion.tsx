"use client";

import { useState } from "react";
import { faqs } from "@/lib/site-content";
import { ChevronDown, HelpCircle } from "lucide-react";

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "General", "Privacy", "Churches", "Technology"];

  const filteredFaqs =
    selectedCategory === "All"
      ? faqs
      : faqs.filter((item) => item.category === selectedCategory);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setOpenIndex(0);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === cat
                ? "bg-[#D9941E] text-white shadow-xs"
                : "bg-[#F7F6F0] text-charcoal-600 hover:text-charcoal-900 border border-[#EAE7DC]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`bg-white border rounded-2xl transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "border-[#D9941E] shadow-sm"
                  : "border-[#EAE7DC] hover:border-[#D6D2C2]"
              }`}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-extrabold text-charcoal-900 text-base"
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-3">
                  <HelpCircle className={`w-4 h-4 shrink-0 ${isOpen ? "text-[#D9941E]" : "text-charcoal-400"}`} />
                  <span>{faq.question}</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-charcoal-500 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-[#D9941E]" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 space-y-2 border-t border-[#EAE7DC]/60 animate-fade-in">
                  {faq.khmerQuestion && (
                    <div className="text-xs font-khmer font-bold text-[#B87814] pt-2">
                      {faq.khmerQuestion}
                    </div>
                  )}
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
