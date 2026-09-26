import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, ChevronDown, HelpCircle, Phone, ArrowRight, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/system/Button";
import { BRAND_CONFIG } from "@/config/brand";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";
import { FAQ_DATA, FAQ_CATEGORIES, type FaqCategoryId } from "@/data/faqData";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: `FAQ & Solar Knowledge Center — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content:
          "Comprehensive guidance on rooftop solar in India: PM Surya Ghar subsidies up to ₹78,000, DISCOM net metering, Omnigrid battery backup, terrace pergolas, and Section 34 tax depreciation.",
      },
      { property: "og:title", content: `FAQ & Solar Knowledge Center — ${BRAND_CONFIG.name}` },
      {
        property: "og:description",
        content:
          "Authoritative advisory on PM Surya Ghar subsidies, DISCOM net-metering approvals, Omnigrid battery safety, and terrace pergolas.",
      },
      { property: "og:image", content: `${BRAND_CONFIG.domain}/media/home-hero-1600w.jpg` },
      { property: "og:url", content: `${BRAND_CONFIG.domain}/faq` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_CONFIG.domain}/faq` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_DATA.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<FaqCategoryId>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [openIds, setOpenIds] = React.useState<Set<string>>(() => {
    // Open the first 3 by default
    return new Set(FAQ_DATA.slice(0, 3).map((q) => q.id));
  });

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredFaqs = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-[#FFFFFF]">
      <Header />

      <main className="pt-24 sm:pt-28 md:pt-32 pb-20">
        {/* Editorial Hero Header */}
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-[12px] font-medium tracking-[0.2em] uppercase text-[#5C5E62] block mb-3">
            Knowledge Base &amp; Regulatory Advisory
          </span>
          <h1 className="text-[32px] sm:text-[42px] md:text-[50px] font-medium tracking-tight leading-[1.12] text-[#171A20] text-balance">
            Frequently Asked Questions
          </h1>
          <p className="text-[15px] sm:text-[17px] font-normal leading-relaxed text-[#5C5E62] max-w-2xl mx-auto mt-3 sm:mt-4 text-balance">
            Authoritative guidance on central subsidies, DISCOM net-metering approvals, Omnigrid
            storage resilience, and architectural terrace engineering.
          </p>

          {/* Interactive Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-[#5C5E62] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subsidies, net metering, battery runtime..."
                className="w-full h-12 pl-12 pr-10 rounded-[6px] border border-[#E3E4E6] bg-[#F4F4F4]/70 text-[15px] text-[#171A20] placeholder:text-[#9CA3AF] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#171A20] transition-all"
                aria-label="Search questions and answers"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 p-1.5 rounded-full text-[#5C5E62] hover:text-[#171A20] hover:bg-[#EAEAEA] transition-colors"
                  aria-label="Clear search query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {FAQ_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`min-h-[38px] px-4 py-1.5 rounded-[4px] text-[13px] font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20] ${
                    active
                      ? "bg-[#171A20] text-[#FFFFFF] shadow-sm"
                      : "bg-[#F4F4F4] text-[#5C5E62] hover:text-[#171A20] hover:bg-[#EAEAEA]"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-[13px] text-[#5C5E62]">
            Showing {filteredFaqs.length} of {FAQ_DATA.length} topics
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-3xl mx-auto px-6 mt-10 space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-12 text-center border border-[#E3E4E6] rounded-[8px] bg-[#F4F4F4]/40 space-y-3">
              <HelpCircle className="w-8 h-8 text-[#5C5E62] mx-auto opacity-60" />
              <div className="text-[17px] font-medium text-[#171A20]">
                No matching answers found
              </div>
              <p className="text-[14px] text-[#5C5E62] max-w-sm mx-auto">
                Could not find anything matching "{searchQuery}". Try a different keyword or contact
                our solar engineering advisory team.
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => openConsultationDrawer()}
                  variant="primary"
                  tone="light"
                  className="mx-auto"
                >
                  Ask a Solar Engineer
                </Button>
              </div>
            </div>
          ) : (
            filteredFaqs.map((item) => {
              const isOpen = openIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="border border-[#E3E4E6] rounded-[6px] bg-[#FFFFFF] transition-colors hover:border-[#171A20]/30"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    className="w-full min-h-[58px] py-4 px-5 sm:px-6 flex items-start justify-between text-left gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20] rounded-[6px]"
                  >
                    <div>
                      <span className="text-[12px] font-medium tracking-[0.14em] uppercase text-[#5C5E62] block mb-1">
                        {item.categoryLabel}
                      </span>
                      <span className="text-[15px] sm:text-[16px] font-medium text-[#171A20] leading-snug">
                        {item.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-[#5C5E62] shrink-0 mt-1 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#171A20]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-[14px] sm:text-[15px] font-normal leading-relaxed text-[#5C5E62] border-t border-[#E3E4E6]/50">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Advisory Dock */}
        <div className="max-w-3xl mx-auto px-6 mt-16 pt-12 border-t border-[#E3E4E6]">
          <div className="p-8 rounded-[8px] bg-[#F4F4F4] text-center space-y-4">
            <h2 className="text-[20px] sm:text-[24px] font-medium text-[#171A20]">
              Have a custom terrace layout or electrical load query?
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#5C5E62] max-w-lg mx-auto leading-relaxed">
              Our solar engineers analyze your roof geometry, electricity bill, and DISCOM sanctions
              to deliver a customized 3D layout in 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                onClick={() => openConsultationDrawer()}
                variant="primary"
                tone="light"
                className="w-full sm:w-auto"
              >
                Schedule Virtual Consultation
              </Button>
              <Button
                href={`tel:${BRAND_CONFIG.contact.phone.dial}`}
                variant="secondary"
                tone="light"
                className="w-full sm:w-auto"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call {BRAND_CONFIG.contact.phone.display}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
