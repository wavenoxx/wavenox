# Wavenox Vision

Act as an elite UI/UX developer. Build the Hero Section and Core Design System for my brand "WAVENOX". Look at the attached images for the basic structural layout (left-aligned text, dark overlay, bottom-left carousel), but elevate it to a billion-dollar, ultra-premium tech aesthetic. 

**CRITICAL BUG FIXES FROM PREVIOUS VERSIONS (STRICT ENFORCEMENT):**

1. **NO BREADCRUMBS**: Do NOT include any breadcrumbs like "Home / Wavenox" in the hero section.

2. **TRUE MOBILE RESPONSIVENESS**: Ensure the `H1` and `CTA button` are NOT massive on mobile. Use fluid scaling (e.g., `text-4xl md:text-6xl`). The CTA button should be sleek `px-6 py-3 w-full md:w-auto`. 

3. **MOBILE MENU**: The desktop nav links must collapse into a clean, functional Hamburger Menu (`☰`) on mobile screens. Do not just hide them.

**1. Hero Section Layout & Aesthetics:**

- **Height**: Full viewport height (`100vh`).

- **Gradient Overlay (CRITICAL)**: Apply a strong linear gradient starting from the left (Deep Black, 90% opacity) fading to transparent on the right. 

- **Header**: Transparent background. Left Logo: Pure ALL-CAPS **`WAVENOX`** (bold, wide-tracking). Right Links: Home, Residential, Commercial, Contact.

**2. Functional 4-Slide Storytelling Carousel:**

- Build a fully functional 4-image auto-scrolling carousel using stunning photorealistic placeholder images of premium homes/commercial roofs.

- The text must dynamically change for each slide. Implement this exact storytelling:

**Slide 01/04**: 

H1: "Absolute power. Zero compromise." (Make "Absolute" `#F57C00`)

H2: "Deploying world-class solar infrastructure for residential and commercial assets. Superior engineering, seamless execution, and absolute energy independence."

**Slide 02/04**:

H1: "Engineered for the future." (Make "Engineered" `#F57C00`)

H2: "Intelligent roof architecture that actively monitors and maximizes your energy generation. Real-time data, AI-driven efficiency, and complete control."

**Slide 03/04**:

H1: "Your roof, your greatest asset." (Make "asset" `#F57C00`)

H2: "Turn sunlight into a high-yielding financial investment. Eliminate rising electricity costs instantly and secure maximum government subsidies across Hyderabad."

**Slide 04/04**:

H1: "Built to last a lifetime." (Make "Built" `#F57C00`)

H2: "From ultra-premium villas to massive commercial hubs, Wavenox delivers Tier-1 solar performance backed by an ironclad 25-year structural warranty."

**3. Interactive Elements:**

- **CTA Button**: Ghost Button below the H2. Transparent, 1px white border, uppercase text: "UNLOCK ENERGY INDEPENDENCE →" (arrow in orange). Hover: Smooth white fill with black text.

- **Carousel Controls (Bottom Left)**: Minimalist indicator dynamically showing the current slide (e.g., "01 / 04"). Next to it, build functional `<` and `>` navigation arrows as thin square boxes. 

- **Arrow Active State**: When the user clicks `<` or `>`, the button background and border must instantly flash Sunburst Orange (`#F57C00`) using a CSS `:active` state.

- **Bottom Right**: KEEP IT COMPLETELY EMPTY. No text.

**Tech Stack**: React, Tailwind CSS, shadcn/ui, Framer Motion. Ensure flawless mobile execution and bug-free carousel state management.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/22a9f031-eb72-4f11-b076-0ffb97d39c06).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
