"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site, primaryNav } from "@/lib/site-content";
import { Menu, X, ArrowRight, Sparkles, Globe } from "lucide-react";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`fi-header transition-all duration-200 ${
          scrolled
            ? "bg-white/95 shadow-sm border-b border-[#EAE7DC]"
            : "bg-[#FCFCFA]/85 backdrop-blur-md border-b border-[#EAE7DC]/60"
        }`}
      >
        <div className="fi-shell fi-header__inner">
        {/* Brand Logo */}
        <Link href="/" className="fi-logo group" aria-label={`${site.name} Homepage`}>
          <span className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D9941E] to-[#EBB94F] flex items-center justify-center text-charcoal-900 shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </span>
            <span className="font-extrabold text-xl tracking-tight text-charcoal-900">
              Faith<span className="text-[#D9941E]">In</span>
            </span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {primaryNav.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#F7F6F0] text-charcoal-900 font-semibold shadow-xs"
                    : "text-charcoal-600 hover:text-charcoal-900 hover:bg-black/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Header Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F7F6F0] border border-[#EAE7DC] text-xs font-semibold text-charcoal-600">
            <Globe className="w-3.5 h-3.5 text-[#D9941E]" />
            <span>ខ្មែរ • EN</span>
          </div>

          <Link
            href={site.appPath}
            className="text-sm font-semibold text-charcoal-700 hover:text-charcoal-900 px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors"
          >
            Sign In
          </Link>

          <Link
            href={site.appPath}
            className="fi-btn fi-btn--primary fi-btn--sm group"
          >
            <span>Start Journey</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href={site.appPath}
            className="fi-btn fi-btn--primary fi-btn--sm text-xs py-1.5 px-3"
          >
            App
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-charcoal-700 hover:bg-black/5 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden fixed inset-x-0 top-[72px] bottom-0 bg-white border-b border-[#EAE7DC] z-40 overflow-y-auto px-6 py-6 flex flex-col justify-between shadow-xl animate-fade-in"
        >
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-charcoal-400 px-3">
              Explore Faith In
            </div>
            <nav className="flex flex-col space-y-1">
              {primaryNav.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold transition-colors ${
                      isActive
                        ? "bg-[#FEF7E6] text-[#B87814]"
                        : "text-charcoal-800 hover:bg-[#F7F6F0]"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#EAE7DC]">
              <div className="flex items-center justify-between px-4 py-2 text-sm text-charcoal-600 bg-[#F7F6F0] rounded-xl">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#D9941E]" />
                  <span>Supported Languages</span>
                </span>
                <span className="font-semibold text-charcoal-900">Khmer / English</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#EAE7DC] space-y-3">
            <Link
              href={site.appPath}
              onClick={() => setMobileMenuOpen(false)}
              className="fi-btn fi-btn--primary w-full justify-center py-3.5 text-base font-bold shadow-md"
            >
              <span>Open Faith In Community</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="text-center text-xs text-charcoal-500">
              100% Free • No subscriptions • Private & Safe
            </div>
          </div>
        </div>
      )}
    </>
  );
}
