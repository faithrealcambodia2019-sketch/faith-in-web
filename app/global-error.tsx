"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#FCFCFA] text-[#0D1017] p-4 font-sans antialiased">
        <div className="max-w-md w-full bg-white border border-[#EAE7DC] rounded-3xl p-8 text-center shadow-lg space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-[#0D1017]">
              Application Error
            </h1>
            <p className="text-sm text-[#445166]">
              A critical error occurred while loading this page. Please try refreshing.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2F5BEA] text-white font-bold text-sm hover:bg-[#5C81F2] transition-all shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
