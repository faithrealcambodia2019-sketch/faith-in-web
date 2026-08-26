import Link from "next/link";
import { site, footerNav } from "@/lib/site-content";
import { Sparkles, Heart, Shield } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="fi-footer">
      <div className="fi-shell">
        <div className="fi-footer__grid">
          {/* Brand & Mission Column */}
          <div className="space-y-4">
            <Link href="/" className="fi-logo group" aria-label={`${site.name} Homepage`}>
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D9941E] to-[#EBB94F] flex items-center justify-center text-charcoal-900 shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </span>
                <span className="font-extrabold text-xl tracking-tight text-charcoal-900">
                  Faith<span className="text-[#D9941E]">In</span>
                </span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-charcoal-600 max-w-sm">
              Discover hope, purpose, and faith for your journey. A reverent, modern sanctuary
              for bilingual Scripture study, encouraging audio blessings, prayer fellowship, and
              Christian community worldwide.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-charcoal-500 font-medium">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#EAE7DC]">
                <Shield className="w-3.5 h-3.5 text-[#059669]" />
                <span>Private & Ad-Free</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#EAE7DC]">
                <Heart className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>100% Free Forever</span>
              </span>
            </div>
          </div>

          {/* Dynamic Navigation Columns */}
          {footerNav.map((col) => (
            <div key={col.title} className="fi-footer__col">
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-charcoal-900 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Inspirational Scripture Quote & Bottom Bar */}
        <div className="mt-8 pt-6 pb-2 border-t border-[#EAE7DC]/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
          <div className="flex items-center gap-2 text-center md:text-left">
            <span className="font-serif italic text-charcoal-700">
              «ដ្បិតព្រះទ្រង់ស្រឡាញ់មនុស្សលោក ដល់ម៉្លេះបានជាទ្រង់ប្រទានព្រះរាជបុត្រាទ្រង់តែ១»
            </span>
            <span className="font-semibold text-[#D9941E]">— យ៉ូហាន ៣:១៦</span>
          </div>

          <div className="flex items-center gap-6">
            <span>&copy; {new Date().getFullYear()} {site.legalName}. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-charcoal-900 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-charcoal-900 transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-charcoal-900 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
