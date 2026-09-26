export interface FaqTopic {
  id: string;
  category:
    "subsidies" | "battery" | "terrace" | "technology" | "billing" | "commercial" | "warranty";
  categoryLabel: string;
  question: string;
  answer: string;
  featured?: boolean;
}

export const FAQ_CATEGORIES = [
  { id: "all", label: "All Topics" },
  { id: "subsidies", label: "Subsidies & Surya Ghar" },
  { id: "battery", label: "Omnigrid & Outages" },
  { id: "terrace", label: "Terrace & Pergolas" },
  { id: "technology", label: "TOPCon Technology" },
  { id: "billing", label: "Net Metering & DISCOMs" },
  { id: "commercial", label: "Commercial & Tax (Sec 32)" },
  { id: "warranty", label: "Warranties & Service" },
] as const;

export type FaqCategoryId = (typeof FAQ_CATEGORIES)[number]["id"];

export const FAQ_DATA: FaqTopic[] = [
  // 1. SUBSIDIES & SURYA GHAR
  {
    id: "subsidy-amount",
    category: "subsidies",
    categoryLabel: "Subsidies & Surya Ghar",
    question: "What is the exact subsidy available under PM Surya Ghar Muft Bijli Yojana?",
    answer:
      "Under the national PM Surya Ghar Muft Bijli Yojana, residential homes receive a direct benefit transfer (DBT) deposited directly into the bank account: ₹30,000 for 1 kW systems, ₹60,000 for 2 kW systems, and a maximum of ₹78,000 for systems 3 kW or larger. Group Housing Societies (GHS) and Resident Welfare Associations (RWA) can claim ₹18,000 per kW up to 500 kW for common area lighting and electric vehicle charging.",
    featured: true,
  },
  {
    id: "subsidy-disbursement-timeline",
    category: "subsidies",
    categoryLabel: "Subsidies & Surya Ghar",
    question: "How long does it take for the central government subsidy to be credited?",
    answer:
      "Once on-site rooftop installation is complete, DISCOM engineers perform a joint meter inspection and install the bi-directional net meter. Following portal commissioning approval by the utility, the Ministry of New and Renewable Energy (MNRE) dispatches the DBT subsidy directly to your Aadhaar-linked bank account within 30 to 45 business days.",
    featured: false,
  },
  {
    id: "subsidy-paperwork-liaison",
    category: "subsidies",
    categoryLabel: "Subsidies & Surya Ghar",
    question: "Do I have to visit DISCOM offices or government departments myself?",
    answer:
      "No. WAVENOX handles the entire regulatory liaison process end-to-end. Our regulatory engineering team creates your National Portal registration, submits technical single-line diagrams (SLD) to your local DISCOM (such as TGSPDCL, TSNPDCL, APEPDCL, APSPDCL, or BESCOM), secures the feasibility sanction, coordinates the physical meter inspection, and submits the commissioning certificate.",
    featured: true,
  },
  {
    id: "almm-dcr-compliance",
    category: "subsidies",
    categoryLabel: "Subsidies & Surya Ghar",
    question: "Are WAVENOX solar modules compliant with MNRE ALMM and DCR mandates?",
    answer:
      "Yes. Every solar panel deployed by WAVENOX for residential subsidy projects is certified under the MNRE Approved List of Models and Manufacturers (ALMM) and complies with Domestic Content Requirement (DCR) rules, guaranteeing unconditional subsidy approval from the central portal.",
    featured: false,
  },

  // 2. BATTERY & OMNIGRID
  {
    id: "outage-switchover-speed",
    category: "battery",
    categoryLabel: "Omnigrid & Outages",
    question: "How quickly does Omnigrid take over during a power outage?",
    answer:
      "Omnigrid integrates high-speed solid-state islanding switchgear that disconnects your home from the utility grid and restores microgrid power in under 20 milliseconds (<20 ms). This transition is instantaneous—desktop computers, home automation servers, Wi-Fi mesh routers, and luxury home entertainment systems stay powered without a flicker or reboot.",
    featured: true,
  },
  {
    id: "running-air-conditioners",
    category: "battery",
    categoryLabel: "Omnigrid & Outages",
    question: "Can Omnigrid battery run 1.5-ton or 2.0-ton air conditioners during blackouts?",
    answer:
      "Yes. Omnigrid features a high-voltage Lithium Iron Phosphate (LiFePO4) architecture delivering 6.0 kW continuous output with a peak surge capability of 10.0 kW. This easily handles the high inrush starting current of 1.5-ton and 2.0-ton 5-star inverter air conditioners, water borewell pumps, and induction cooktops simultaneously.",
    featured: true,
  },
  {
    id: "lifepo4-battery-safety",
    category: "battery",
    categoryLabel: "Omnigrid & Outages",
    question: "Is Omnigrid safe in extreme 45°C+ Indian summer heat?",
    answer:
      "Omnigrid utilizes Lithium Iron Phosphate (LiFePO4) cell chemistry, widely recognized as the safest lithium-ion technology in existence. Unlike conventional nickel-manganese-cobalt (NMC) chemistries, LiFePO4 cells are chemically stable up to 270°C, eliminating thermal runaway risk even when ambient garage or terrace temperatures exceed 50°C. Units are IP65 weather-rated and tested to IEC 62619 safety standards.",
    featured: false,
  },
  {
    id: "modular-battery-expansion",
    category: "battery",
    categoryLabel: "Omnigrid & Outages",
    question: "Can I start with solar first and add an Omnigrid battery later?",
    answer:
      "Yes. All WAVENOX residential installations utilize hybrid-ready inverters. You can install our low-profile monolithic solar array today and seamlessly plug in an Omnigrid storage stack at any point in the future. Battery capacity can also be scaled modularly in 14.3 kWh increments (up to 28.6 kWh dual-pack or 42.9 kWh triple-stack) as your family's evening consumption or EV charging requirements expand.",
    featured: false,
  },

  // 3. TERRACE & PERGOLAS
  {
    id: "terrace-usable-space",
    category: "terrace",
    categoryLabel: "Terrace & Pergolas",
    question: "Can I still walk, dry clothes, or host gatherings on my terrace after installation?",
    answer:
      "Absolutely. Unlike conventional low-budget solar installations that clutter rooftops with knee-high scaffolding, WAVENOX engineers custom elevated solar pergolas maintaining 7 to 9 feet of clear headroom throughout. Your terrace transforms into a shaded outdoor architectural living pavilion while bifacial panels produce clean power overhead.",
    featured: true,
  },
  {
    id: "terrace-slab-damage-leakage",
    category: "terrace",
    categoryLabel: "Terrace & Pergolas",
    question: "Will installing solar on my terrace cause roof leakage or crack the slab?",
    answer:
      "Never. WAVENOX enforces a strict Zero Slab Damage protocol. Depending on your terrace structure, we employ pre-cast ballasted foundation blocks (requiring zero slab penetration) or chemical-anchor fastener pedestals sealed with multi-layer marine-grade polyurethane elastomeric membranes. Every installation includes a 5-year structural waterproofing guarantee.",
    featured: true,
  },
  {
    id: "cyclone-wind-gust-ratings",
    category: "terrace",
    categoryLabel: "Terrace & Pergolas",
    question: "How do WAVENOX elevated structures perform during cyclones and monsoons?",
    answer:
      "All mounting structures are fabricated from structural 6063-T6 architectural anodized aluminum and heavy-gauge hot-dip galvanized steel (80+ micron zinc coating). Engineered in accordance with IS 875 (Part 3) wind load standards, our pergolas are structurally rated to withstand 170 km/h wind gusts, ensuring total resilience through coastal cyclones and severe squalls.",
    featured: false,
  },

  // 4. TOPCON TECHNOLOGY & SOLAR CELLS
  {
    id: "n-type-topcon-vs-perc",
    category: "technology",
    categoryLabel: "TOPCon Technology",
    question: "What makes N-type TOPCon panels superior to conventional P-type PERC panels?",
    answer:
      "N-type Tunnel Oxide Passivated Contact (TOPCon) represents the cutting edge of silicon photovoltaics. Compared to older P-type PERC panels, TOPCon modules offer higher conversion efficiency (22.8% vs ~20.5%), zero Light-Induced Degradation (LID), significantly better weak-light generation during dawn and overcast monsoon days, and an industry-leading -0.30%/°C temperature coefficient.",
    featured: false,
  },
  {
    id: "high-temperature-performance",
    category: "technology",
    categoryLabel: "TOPCon Technology",
    question: "Do solar panels produce less power when the ambient temperature is 42°C+?",
    answer:
      "All solar panels experience reduced voltage as temperatures rise. However, WAVENOX N-type TOPCon cells feature an ultra-low temperature coefficient of -0.30% per °C (compared to -0.38% to -0.42% for standard panels). During scorching 44°C peak summer afternoons across Telangana and Andhra Pradesh, WAVENOX panels deliver up to 8% more energy than standard modules.",
    featured: true,
  },
  {
    id: "bifacial-rear-gain",
    category: "technology",
    categoryLabel: "TOPCon Technology",
    question: "What is bifacial generation and how does it benefit a residential terrace?",
    answer:
      "Bifacial solar modules feature dual tempered glass sheets that generate electricity from both the top and the underside. When elevated on our terrace pergolas, the underside captures ambient sunlight reflected off the terrace floor (albedo). When paired with light-colored terrace tiles or white reflective heat-resistant paint, bifacial modules deliver an additional 10% to 25% energy yield from the exact same rooftop footprint.",
    featured: false,
  },
  {
    id: "dust-soiling-cleaning",
    category: "technology",
    categoryLabel: "TOPCon Technology",
    question: "How does Indian dust affect generation, and how often must panels be cleaned?",
    answer:
      "WAVENOX modules utilize hydrophobic, anti-reflective nano-textured front glass that sheds dust easily. In urban environments, a light water rinse once every 2 to 3 weeks maintains peak output. In elevated pergola installations, an integrated low-pressure misting line or standard garden hose attachment makes cleaning effortless without climbing onto precarious roofs.",
    featured: false,
  },

  // 5. NET METERING & DISCOM BILLING
  {
    id: "net-metering-operation",
    category: "billing",
    categoryLabel: "Net Metering & DISCOMs",
    question: "How does net metering work on my monthly electricity bill?",
    answer:
      "A bi-directional net meter records two numbers: units (kWh) consumed from the utility grid, and excess units exported to the grid from your solar panels during sunny daytime hours. At the end of the monthly billing cycle, your DISCOM bills you only for the net difference (Import minus Export). If you export more than you consume, surplus credits roll over to offset subsequent bills.",
    featured: true,
  },
  {
    id: "discom-banking-rules",
    category: "billing",
    categoryLabel: "Net Metering & DISCOMs",
    question: "What are the solar banking rules in Telangana, Andhra Pradesh, and Karnataka?",
    answer:
      "In Telangana (TGSPDCL / TSNPDCL) and Andhra Pradesh (APEPDCL / APSPDCL), excess solar credits bank month-to-month and settle annually at the tariff determined by the respective State Electricity Regulatory Commission (SERC). In Karnataka (BESCOM), net metering is available for domestic consumers up to sanctioned transformer capacity. WAVENOX coordinates all utility tariff filings automatically.",
    featured: false,
  },
  {
    id: "sanctioned-load-limits",
    category: "billing",
    categoryLabel: "Net Metering & DISCOMs",
    question: "Can I install a solar system larger than my DISCOM sanctioned connected load?",
    answer:
      "Utility regulations require that your rooftop solar plant capacity cannot exceed your sanctioned connected load (e.g., if your sanctioned load is 5 kW, maximum permitted solar is 5 kW). If your roof has space for a 10 kW system to offset heavy AC usage, WAVENOX will file an official load enhancement application with your DISCOM alongside your solar application.",
    featured: false,
  },

  // 6. COMMERCIAL, INDUSTRIAL & TAXES (SECTION 32)
  {
    id: "section-32-accelerated-depreciation",
    category: "commercial",
    categoryLabel: "Commercial & Tax (Sec 32)",
    question: "How does Section 32 40% accelerated tax depreciation work for businesses?",
    answer:
      "Under Section 32 of the Indian Income Tax Act, commercial and industrial enterprises investing in rooftop solar capital assets can claim 40% accelerated depreciation in Year 1 (or 20% if commissioned in the second half of the fiscal year). For a profitable corporate entity in the 25%–30% corporate tax bracket, this delivers immediate tax savings equal to roughly 10%–12% of the total project CAPEX in the first year alone.",
    featured: true,
  },
  {
    id: "commercial-payback-period",
    category: "commercial",
    categoryLabel: "Commercial & Tax (Sec 32)",
    question: "What is the typical return on investment (ROI) for commercial solar in India?",
    answer:
      "Commercial and industrial tariffs across Telangana, Andhra Pradesh, and Karnataka range between ₹8.50 and ₹12.50 per unit. Combined with 40% accelerated depreciation and GST input tax credits (ITC), typical payback periods range between 3.0 and 4.2 years. Over a 25-year asset lifecycle, commercial solar delivers an internal rate of return (IRR) typically exceeding 28%.",
    featured: false,
  },
  {
    id: "open-access-vs-rooftop",
    category: "commercial",
    categoryLabel: "Commercial & Tax (Sec 32)",
    question: "What is the difference between captive rooftop solar and group captive open access?",
    answer:
      "Captive rooftop solar generates electricity directly on your facility roof behind the commercial meter, eliminating all grid transmission losses, wheeling charges, and cross-subsidy surcharges. Open access involves procuring power from an off-site solar park across the utility transmission grid, which is typically recommended only when your facility roof area is insufficient to meet your total electrical demand.",
    featured: false,
  },

  // 7. WARRANTIES, SERVICE & MONITORING
  {
    id: "25-year-linear-warranty-breakdown",
    category: "warranty",
    categoryLabel: "Warranties & Service",
    question: "What does the 25-Year Linear Power Guarantee actually cover?",
    answer:
      "Our 25-Year Linear Asset Guarantee guarantees that power degradation will not exceed 1.0% in Year 1 and will degrade by no more than 0.40% to 0.55% per year thereafter. At Year 25, your solar panels are guaranteed to produce at least 84.8% of their original nameplate output. If a module fails to meet this curve, it is repaired or replaced at zero cost under warranty.",
    featured: true,
  },
  {
    id: "inverter-and-battery-warranties",
    category: "warranty",
    categoryLabel: "Warranties & Service",
    question: "What are the warranty terms for the inverter and Omnigrid battery?",
    answer:
      "Hybrid smart string inverters come with a 10-year comprehensive manufacturer warranty. Omnigrid battery storage units carry a 10-year / 6,000-cycle performance warranty guaranteeing at least 70% capacity retention at the end of 10 years of daily charge-discharge cycling.",
    featured: false,
  },
  {
    id: "realtime-telemetry-monitoring",
    category: "warranty",
    categoryLabel: "Warranties & Service",
    question: "How do I monitor solar generation and battery levels from my phone?",
    answer:
      "Every WAVENOX system is equipped with encrypted Wi-Fi and 4G IoT telemetry. Through the WAVENOX mobile application, you can view realtime generation, home power consumption, battery state-of-charge, grid import/export, and carbon offsets in sub-second intervals from anywhere in the world.",
    featured: false,
  },
  {
    id: "service-sla-response-time",
    category: "warranty",
    categoryLabel: "Warranties & Service",
    question: "What is your Service Level Agreement (SLA) if my system has an issue?",
    answer:
      "Our central command center monitors system telemetry 24/7. In the rare event of an inverter fault, grid anomaly, or panel mismatch, our monitoring algorithms trigger an automated alert. For residential customers across Hyderabad, Bengaluru, and Vijayawada, we provide a guaranteed 48-hour on-site dispatch SLA by certified solar service engineers.",
    featured: false,
  },
];
