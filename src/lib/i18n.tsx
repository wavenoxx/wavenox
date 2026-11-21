import * as React from "react";

export type SupportedLanguage = "en" | "te";

export interface Translations {
  // Navigation
  navResidential: string;
  navOmnigrid: string;
  navTechnology: string;
  navNetMetering: string;
  navStudio: string;
  navAboutProject: string;
  navContact: string;

  // Hero & CTAs
  heroTitle: string;
  heroSubtitle: string;
  ctaDesignYours: string;
  ctaEstimate: string;
  ctaDiscussWhatsApp: string;
  ctaRequestSpec: string;

  // Key Stats
  statSubsidyTitle: string;
  statSubsidyValue: string;
  statGenerationTitle: string;
  statGenerationValue: string;
  statWindTitle: string;
  statWindValue: string;
  statDegradationTitle: string;
  statDegradationValue: string;

  // Sizing & Calculator
  sizingTitle: string;
  monthlyBillLabel: string;
  systemCapacityLabel: string;
  batteryStorageLabel: string;
  terraceProfileLabel: string;
  effectiveCostLabel: string;
  twentyFiveYearSavingsLabel: string;
  billDecoderHeadline: string;
  satelliteSketcherLabel: string;

  // Regulatory & Disclosure
  discomBadge: string;
  honestTimelineBadge: string;
  conceptCreditNotice: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    navResidential: "Residential",
    navOmnigrid: "Omnigrid",
    navTechnology: "Technology",
    navNetMetering: "Net Metering",
    navStudio: "Design Studio",
    navAboutProject: "About Project",
    navContact: "WhatsApp Liaison",

    heroTitle: "Architectural Rooftop Solar for Indian Residences",
    heroSubtitle:
      "Engineered elevated pergolas, N-type TOPCon bifacial modules, and DISCOM net-metering synchronization.",
    ctaDesignYours: "Design Yours",
    ctaEstimate: "Get Estimate",
    ctaDiscussWhatsApp: "Discuss on WhatsApp",
    ctaRequestSpec: "Request Technical Spec Sheet",

    statSubsidyTitle: "National Subsidy",
    statSubsidyValue: "Up to ₹78,000",
    statGenerationTitle: "Annual Yield",
    statGenerationValue: "1,490+ kWh/kWp",
    statWindTitle: "Wind Resilience",
    statWindValue: "44–50 m/s (IS 875)",
    statDegradationTitle: "25-Yr Performance",
    statDegradationValue: "≥89.4% Output",

    sizingTitle: "Architectural Solar Design Studio",
    monthlyBillLabel: "Monthly Electricity Bill",
    systemCapacityLabel: "Sizing Capacity",
    batteryStorageLabel: "Omnigrid Storage",
    terraceProfileLabel: "Terrace Architecture",
    effectiveCostLabel: "Effective Cost After Subsidy",
    twentyFiveYearSavingsLabel: "25-Year Est. Savings",
    billDecoderHeadline: "DISCOM Bill Decoder",
    satelliteSketcherLabel: "Rooftop Dimensions & Zones",

    discomBadge: "Pan-India DISCOM Net-Metering Ready",
    honestTimelineBadge: "Statutory 15–30 Day Processing Target",
    conceptCreditNotice: "Indicative solar modeling subject to site verification.",
  },
  te: {
    navResidential: "నివాస సోలార్",
    navOmnigrid: "బ్యాటరీ నిల్వ",
    navTechnology: "సాంకేతికత",
    navNetMetering: "నెట్ మీటరింగ్",
    navStudio: "డిజైన్ స్టూడియో",
    navAboutProject: "ప్రాజెక్ట్ వివరాలు",
    navContact: "వాట్సాప్ సంప్రదింపు",

    heroTitle: "భారతీయ నివాసాల కోసం ఆధునిక రూఫ్‌టాప్ సోలార్ ఆర్కిటెక్చర్",
    heroSubtitle:
      "ఎలివేటెడ్ టెర్రస్ పెర్గోలా స్ట్రక్చర్లు, N-టైప్ టాప్‌కాన్ బైఫేషియల్ సెల్స్ మరియు డిస్కం నెట్-మీటరింగ్ సమన్వయం.",
    ctaDesignYours: "సిస్టమ్ డిజైన్ చేయండి",
    ctaEstimate: "ఎస్టిమేట్ పొందండి",
    ctaDiscussWhatsApp: "వాట్సాప్‌లో మాట్లాడండి",
    ctaRequestSpec: "టెక్నికల్ స్పెసిఫికేషన్ షీట్",

    statSubsidyTitle: "జాతీయ సబ్సిడీ",
    statSubsidyValue: "రూ. 78,000 వరకు",
    statGenerationTitle: "వార్షిక ఉత్పత్తి",
    statGenerationValue: "1,490+ kWh/kWp",
    statWindTitle: "తుఫాను నిరోధకత",
    statWindValue: "44–50 m/s (IS 875)",
    statDegradationTitle: "25 ఏళ్ల పనితీరు",
    statDegradationValue: "≥89.4% సామర్థ్యం",

    sizingTitle: "సోలార్ డిజైన్ స్టూడియో",
    monthlyBillLabel: "నెలవారీ కరెంట్ బిల్లు",
    systemCapacityLabel: "సిస్టమ్ పరిమాణం",
    batteryStorageLabel: "బ్యాటరీ నిల్వ (Omnigrid)",
    terraceProfileLabel: "టెర్రస్ ఆర్కిటెక్చర్",
    effectiveCostLabel: "సబ్సిడీ తర్వాత నికర ఖర్చు",
    twentyFiveYearSavingsLabel: "25 ఏళ్ల మొత్తం ఆదా",
    billDecoderHeadline: "డిస్కం విద్యుత్ బిల్లు డీకోడర్",
    satelliteSketcherLabel: "రూఫ్‌టాప్ కొలతలు & జోన్‌లు",

    discomBadge: "పాన్-ఇండియా డిస్కం నెట్-మీటరింగ్ అనుకూలం",
    honestTimelineBadge: "చట్టబద్ధమైన 15–30 రోజుల ప్రాసెసింగ్ వ్యవధి",
    conceptCreditNotice: "సైట్ పరిశీలనకు లోబడి సూచనాత్మక సోలార్ అంచనా.",
  },
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<SupportedLanguage>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wnx_lang");
      if (saved === "te" || saved === "en") return saved;
    }
    return "en";
  });

  const setLanguage = React.useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("wnx_lang", lang);
      document.documentElement.lang = lang;
    }
  }, []);

  // Sync html lang attribute (do not emit fake localized hreflang links on English-only URLs)
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = language;
  }, [language]);

  const value = React.useMemo(
    () => ({
      language,
      setLanguage,
      t: TRANSLATIONS[language],
    }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) {
    // Graceful fallback for components rendered outside provider
    return {
      language: "en" as SupportedLanguage,
      setLanguage: () => {},
      t: TRANSLATIONS.en,
    };
  }
  return context;
}
