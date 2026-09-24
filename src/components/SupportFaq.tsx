import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Phone, MessageSquare, HelpCircle } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "How does DISCOM net-metering work in my state?",
    a: "Your WAVENOX solar array generates clean electricity during peak sunlight hours. Power is consumed first by your home's active loads. Excess units are exported to your local electricity board (TSSPDCL, BESCOM, MSEDCL, etc.) via a bi-directional smart net-meter. At night, your home draws power back from the grid. At the end of the billing cycle, your DISCOM deducts exported solar units from imported units, ensuring you only pay for net energy or receive a carry-forward rupee credit.",
  },
  {
    q: "How do I receive the PM Surya Ghar government subsidy?",
    a: "Under the PM Surya Ghar: Muft Bijli Yojana, residential installations receive direct government subsidies: ₹30,000 for 1 kW, ₹60,000 for 2 kW, and ₹78,000 for 3 kW and above (residential only). To qualify, installations must be performed by a registered vendor with ALMM-listed modules. WAVENOX prepares and files your applications. Once your net-meter is commissioned, the subsidy is typically disbursed by the government portal directly via DBT into your bank account within 1–3 months after commissioning.",
  },
  {
    q: "Will panel installation cause roof leaks or void terrace waterproofing?",
    a: "No. Where structural requirements allow, WAVENOX utilizes non-penetrative ballast engineering and specialized weather-resistant chemical anchoring. Every mounting interface is sealed with UV-stabilized waterproofing barriers, protecting the integrity of your terrace.",
  },
  {
    q: "How much electricity do panels produce during Indian monsoons and cloudy days?",
    a: "WAVENOX N-Type TOPCon bifacial modules capture diffuse sunlight even on overcast monsoon days, continuing to generate power at reduced capacity. When paired with Omnigrid battery storage, your home maintains continuous power during grid outages.",
  },
  {
    q: "What is covered under the warranty?",
    a: "WAVENOX provides a multi-tier warranty: a workmanship and equipment warranty covering mounting fixtures, framing, and inverters against manufacturing defects, alongside a 25-Year Linear Performance Warranty on solar modules ensuring long-term generation integrity.",
  },
  {
    q: "What is the typical financial payback (ROI) timeline in India?",
    a: "Payback varies based on your DISCOM tariff, system size, and whether your home qualifies for the PM Surya Ghar subsidy. For high-consumption residential villas in India, typical payback ranges between 3 to 5 years, followed by decades of lower electricity costs. You can test your exact numbers in our Design Studio.",
  },
];

export function SupportFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="relative w-full bg-[#F8F8FA] text-[#171A20] py-24 sm:py-32 lg:py-36 overflow-hidden border-b border-[#E2E8F0]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5C5E62]"
          >
            Support & FAQ
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#171A20] mt-2"
          >
            Frequently Asked Questions
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-[#393C41] mt-3 leading-relaxed"
          >
            Clear, transparent answers to the most common questions about switching to architectural
            solar in India.
          </motion.p>
        </div>

        {/* Clean Minimalist Accordion List */}
        <div className="mt-12 sm:mt-16 space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl bg-white border border-[#E2E8F0] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F8F8FA]/50 transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-[#171A20] leading-snug">
                    {item.q}
                  </span>
                  <div
                    className={`p-1.5 rounded-full transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 bg-[#171A20] text-white" : "bg-[#F8F8FA] text-[#5C5E62]"
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#5C5E62] leading-relaxed border-t border-[#E2E8F0]/60 pt-4">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Still Have Questions Advisor Bar */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h4 className="text-sm sm:text-base font-semibold text-[#171A20]">
              Still have questions about your roof?
            </h4>
            <p className="text-xs text-[#5C5E62] mt-0.5">
              Speak directly with an authorized WAVENOX Energy Advisor in Hyderabad.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`tel:${BRAND_CONFIG.contact.phone.dial}`}
              className="px-5 py-2.5 rounded-full bg-[#171A20] text-white text-xs font-medium hover:bg-black transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Phone size={14} />
              <span>Call Advisor</span>
            </a>
            <a
              href={BRAND_CONFIG.contact.whatsapp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-[#EEEEEE] text-[#171A20] text-xs font-medium hover:bg-[#E2E8F0] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare size={14} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
