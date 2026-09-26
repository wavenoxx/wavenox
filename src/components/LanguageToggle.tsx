import * as React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export interface LanguageToggleProps {
  className?: string;
  showIcon?: boolean;
  tone?: "light" | "dark";
}

export function LanguageToggle({
  className = "",
  showIcon = true,
  tone = "light",
}: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  const isDark = tone === "dark";

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={`inline-flex items-center gap-1 p-0.5 rounded-[4px] border text-[12px] font-medium transition-colors ${
        isDark
          ? "bg-black/40 border-white/30 text-white"
          : "bg-[#F4F4F4] border-[#E3E4E6] text-[#171A20]"
      } ${className}`}
    >
      {showIcon && (
        <span
          className={`pl-1.5 pr-0.5 ${isDark ? "text-white" : "text-[#171A20]"}`}
          aria-hidden="true"
        >
          <Globe className="w-3.5 h-3.5" />
        </span>
      )}

      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`px-2 py-0.5 rounded-[3px] text-[12px] transition-all cursor-pointer ${
          language === "en"
            ? isDark
              ? "bg-[#FFFFFF] text-[#171A20] font-semibold shadow-xs"
              : "bg-[#171A20] text-[#FFFFFF] font-semibold shadow-xs"
            : isDark
              ? "text-[#FFFFFF] hover:bg-white/20"
              : "text-[#171A20] hover:bg-[#EAEAEA]"
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLanguage("te")}
        aria-pressed={language === "te"}
        className={`px-2 py-0.5 rounded-[3px] text-[12px] transition-all cursor-pointer ${
          language === "te"
            ? isDark
              ? "bg-[#FFFFFF] text-[#171A20] font-semibold shadow-xs"
              : "bg-[#171A20] text-[#FFFFFF] font-semibold shadow-xs"
            : isDark
              ? "text-[#FFFFFF] hover:bg-white/20"
              : "text-[#171A20] hover:bg-[#EAEAEA]"
        }`}
      >
        తెలుగు
      </button>
    </div>
  );
}
