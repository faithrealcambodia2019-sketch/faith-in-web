import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { site } from "@/lib/site-content";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white border border-[#EAE7DC] rounded-3xl p-8 sm:p-10 text-center shadow-lg space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#E9EFFE] border border-[#C9D8FC] text-[#1E40AF] flex items-center justify-center mx-auto shadow-xs">
          <Sparkles className="w-8 h-8 text-[#2F5BEA]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
            404 • Page Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            We couldn&apos;t find that page
          </h1>
          <p className="text-sm text-charcoal-600 leading-relaxed">
            The page you are looking for might have been moved, renamed, or is currently unavailable.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="fi-btn fi-btn--primary w-full sm:w-auto">
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link href={site.appPath} className="fi-btn fi-btn--secondary w-full sm:w-auto">
            <span>Open App</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
