import { Globe } from "lucide-react";

type BrandWordmarkProps = {
  /** Tailwind size classes for the wordmark text, e.g. "text-xl". */
  textClassName?: string;
  /** Tailwind size classes for the globe glyph, e.g. "w-5 h-5". */
  iconClassName?: string;
  /** Colour class for both marks. Override on dark surfaces. */
  toneClassName?: string;
};

/**
 * The FaithIn brand lockup: the blue "FaithIn" wordmark followed by the globe
 * glyph, matching the mark used inside the app.
 */
export function BrandWordmark({
  textClassName = "text-xl",
  iconClassName = "w-[1.05em] h-[1.05em]",
  toneClassName = "text-[#2F5BEA]",
}: BrandWordmarkProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${toneClassName}`}>
      <span className={`font-extrabold tracking-[-0.03em] leading-none ${textClassName}`}>
        FaithIn
      </span>
      <Globe className={`${iconClassName} shrink-0`} strokeWidth={2.25} aria-hidden="true" />
    </span>
  );
}
