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
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-[4px] border text-[11px] font-medium transition-colors ${
        isDark
          ? "bg-white/10 border-white/20 text-white"
          : "bg-[#F4F4F4] border-[#E3E4E6] text-[#171A20]"
      } ${className}`}
    >
      {showIcon && (
        <span
          className={`pl-1.5 pr-0.5 ${isDark ? "text-white/70" : "text-[#5C5E62]"}`}
          aria-hidden="true"
        >
          <Globe className="w-3 h-3" />
        </span>
      )}

      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`px-1.5 py-0.5 rounded-[3px] transition-all cursor-pointer ${
          language === "en"
            ? isDark
              ? "bg-white text-[#171A20] shadow-xs font-semibold"
              : "bg-[#171A20] text-[#FFFFFF] shadow-xs font-semibold"
            : isDark
              ? "text-white/80 hover:text-white"
              : "text-[#5C5E62] hover:text-[#171A20]"
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLanguage("te")}
        aria-pressed={language === "te"}
        className={`px-1.5 py-0.5 rounded-[3px] transition-all cursor-pointer ${
          language === "te"
            ? isDark
              ? "bg-white text-[#171A20] shadow-xs font-semibold"
              : "bg-[#171A20] text-[#FFFFFF] shadow-xs font-semibold"
            : isDark
              ? "text-white/80 hover:text-white"
              : "text-[#5C5E62] hover:text-[#171A20]"
        }`}
      >
        తెలుగు
      </button>
    </div>
  );
}
