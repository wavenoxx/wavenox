# WAVENOX — AI Visual Upgrade Brief

_For Antigravity's image model (Nano Banana / Gemini image). Save in the repo as `docs/IMAGE_BRIEF.md`._

**Goal:** keep the Tesla-grade, full-bleed, cinematic "wow" of the current site, but make every frame look like a real photograph taken in Hyderabad of a real, correctly engineered Indian solar installation. Nothing duller than today: same drama, more truth.

---

## 1. The five rules

1. **Cinematic but photographic.** Golden hour, blue hour, monsoon drama, clean compositions — shot like a real architectural photographer (35 mm, f/8, natural grade). No CGI gloss, no neon orange skies, no HDR halo.
2. **India, specifically Hyderabad.** Flat RCC roofs with parapets, granite boulders (Jubilee Hills), teak and stone villas, neem and coconut palms, bougainvillea, black cylindrical water tanks, Deccan haze. No snow, shingle roofs, US streets, US road markings or cars.
3. **Engineering that a solar engineer would sign off.** All-black panels, identical sizes, in straight parallel rows, all tilted the same way (about 10–15° towards the south on flat roofs), on visible but tidy black mounting, with walkways between rows and cables in trays. Nothing floating, melting or merging. Shadows match the sun.
4. **Built for the layout.** Every hero leaves the **top third calm** (sky or soft background) for the headline and the **bottom quarter darker and simple** for the stat dock and buttons.
5. **One visual world.** Same colour grade and camera language on every page. The home, pergola, night-interior and battery shots are the **same villa** (use the approved hero as a reference image). Desktop and mobile show the **same scene**, recomposed — never a different house.

---

## 2. Style block (append to every prompt)

```
Photorealistic architectural photograph, full-frame camera, 35mm lens, f/8, natural colour grade with soft realistic contrast, true-to-life materials and textures, gentle atmospheric haze, physically accurate light and shadows. Calm, uncluttered upper third for a headline; simpler, slightly darker lower quarter. No text, no signage, no logos, no watermarks, no brand names, no licence plates, no people looking at the camera. No CGI look, no oversaturation, no HDR halos, no lens-flare streaks.
```

## 3. Solar realism block (append to every rooftop prompt)

```
Solar array: identical all-black monocrystalline panels with black frames and a fine visible cell grid, about 2.3 m × 1.1 m each, in straight parallel rows with even gaps and a clear walkway, all tilted about 12 degrees towards the south on a slim matte-black aluminium structure raised on small concrete footing blocks above a flat RCC roof, cables hidden in a black tray along the parapet. Every panel the same size and angle; nothing floating, warped or merged.
```

## 4. Technical settings

- Generate at the model's highest resolution (**2K minimum, 4K preferred; ≥ 2400 px on the long side**).
- Desktop: **16:9**. Mobile: **9:16**, made from the approved desktop image as a reference ("same scene, same light, same camera height, recomposed vertically") — never a fresh generation.
- Make 4 variants per shot, pick the best, then refine with targeted edits ("straighten the third row", "remove the car", "darken the lower quarter").
- Never write "Tesla" or any brand in a prompt (it pulls in their products and logos).
- Masters go to `src/assets/` named `<slug>-master.jpg` and `<slug>-mobile-master.jpg`; run `npm run images`. The build script must not upscale (see the fix plan).

---

## 5. Shot list (15 images in use)

Pages in brackets. Replace the current file for each slug. Delete the unused `liquid-glass` and `homes-hero`.

### 5.1 `home-hero` — [/ hero, OG image, fallback on 7 pages]
**Says:** "This is what solar looks like on the best home in the city."
```
Aerial three-quarter view from about 25 m of a contemporary two-storey luxury villa in Jubilee Hills, Hyderabad, at golden hour. Warm sandstone and teak louvres, floor-to-ceiling glass glowing softly, a long infinity pool, lawn, bougainvillea, coconut palms and large natural granite boulders in the garden. On the flat roof, behind a clean parapet, a neat array of 18 all-black solar panels. Soft haze over the Deccan hills and faint distant towers of the Financial District. Low warm sun from the left, long natural shadows. Clear, calm sky across the top third.
```
**Alt:** Contemporary villa at golden hour with black solar panels on its flat roof and a pool in the garden.

### 5.2 `home-design` — [/ "Clean, all-black design", technology, our-story, menu]
```
Eye-level photograph on the same villa's rooftop terrace in late-afternoon light. A low-profile row of all-black solar panels on a slim matte-black frame runs diagonally from lower left to right; the cable tray is hidden along the parapet. Grey Kota stone floor, a glass balustrade, one potted frangipani. Side light rakes across the glass so the fine cell pattern shows. Background softly out of focus: tree canopy and pale sky.
```
**Alt:** All-black solar panels on a low black frame beside a glass balustrade on a stone terrace.

### 5.3 `home-outage` — [/ "Power through outages"]
**Must fix:** today the "power cut" has lit streetlights and neighbours.
```
Blue-hour photograph of a quiet residential lane in Hyderabad during a power cut. Every neighbouring house and every streetlight is completely dark; only one contemporary villa glows warmly from inside, its black rooftop array just visible against the deep blue sky. Light monsoon mist, the wet road reflecting the villa's warm light, no moving cars, no people. The dark houses still show faint detail from the sky.
```
**Alt:** Blue-hour street during a power cut: one house lit, its neighbours and streetlights dark.

### 5.4 `home-heat` — [/ "Built for Indian heat", technology]
**Must fix:** today it is a black tablet, not a solar panel.
```
Low-angle close-up along the surface of an all-black solar panel on a Hyderabad rooftop at 1 pm in May. Fine multi-busbar cell pattern visible under the glass, a thin film of dust near one edge, visible heat shimmer above the roof, the sun high and bright in a pale hazy sky, the neighbouring rooftops blurred in the background.
```
**Alt:** Low-angle close-up of a black solar panel under harsh midday sun and heat shimmer.

### 5.5 `home-final` — [/ and /residential consultation panel, technology, menu]
```
Twilight on the same villa's rooftop terrace under an elevated black steel solar pergola about 2.7 m high; the undersides of the panels form the ceiling. Warm string lights, a low teak dining table, a family of three in relaxed conversation seen from the side, jute rug, planters. Beyond the parapet: the city lights of Gachibowli and a fading orange horizon.
```
**Alt:** A family dining at twilight under a solar pergola on a rooftop terrace with city lights beyond.

### 5.6 `res-hero` — [/residential hero, Design Studio "Villa" view, menu]
```
Front elevation of a symmetrical contemporary Indian villa at dusk in Banjara Hills: stone cladding, tall teak doors, warm interior light, a granite driveway, a neem tree framing the left edge. The flat roof shows a low black solar array above the parapet line. Deep blue sky with the last warm light at the horizon.
```
**Alt:** Front of a stone-clad villa at dusk with a low black solar array along its roofline.

### 5.7 `res-terrace` — [/residential "Designed for your terrace", menu]
**Must fix:** today it duplicates a clifftop mansion.
```
Morning photograph of an independent G+2 home's rooftop in Hyderabad. An elevated black solar structure about 2.4 m high covers half the terrace and keeps the space underneath usable: a wooden swing, a clothes line, a potted tulsi, a black cylindrical water tank on a small platform in the corner, parapet walls painted off-white. Neighbouring terraces with their own water tanks in the soft background.
```
**Alt:** Rooftop terrace with an elevated solar structure shading a swing, plants and a water tank.

### 5.8 `res-weather` — [/residential "Severe weather resilience", menu]
```
Monsoon storm over Hyderabad rooftops: heavy rain streaks, dark rolling clouds, water beading and sheeting off a tilted all-black array on an elevated structure. In the sharp foreground, robust bolted clamps and a black rail. A faint break of light on the horizon.
```
**Alt:** Heavy monsoon rain running off a tilted solar array, with bolted clamps in the foreground.

### 5.9 `omnigrid-hero` — [/omnigrid hero, menu]
**Must fix:** today it looks like a TV bezel. Must **not** resemble any known brand's battery (no single large rounded white wall slab).
```
Product photograph in a minimal utility room of the same villa: three stacked matte-graphite battery modules (each about 60 × 45 × 20 cm) on a low plinth, a thin soft-white status light line on the top module, a slim hybrid inverter mounted on the wall above, neat conduits rising into the ceiling. Microcement wall, soft window light from the left, a potted plant for scale. Premium, calm, real.
```
**Alt:** A stack of three graphite battery modules with an inverter above, in a minimal utility room.

### 5.10 `omnigrid-switchover` — [/omnigrid "Outage protection", technology, menu]
```
Night detail in the dim utility room: the battery stack's status light glowing soft white, the inverter's small display lit, the rest of the house dark through an open doorway. Shallow depth of field, real textures of metal and microcement.
```
**Alt:** Battery status light and inverter display glowing in a dark utility room at night.

### 5.11 `omnigrid-night` — [/omnigrid "Use solar after sunset", menu]
```
Evening interior of the same villa's double-height living room, warmly lit: lamps on, a ceiling fan turning, a teenager reading on the sofa, a parent in the open kitchen. Through the tall window, the neighbourhood outside is dark during a power cut. Calm, cinematic, natural light levels.
```
**Alt:** A warmly lit living room at night while the neighbourhood outside is dark.

### 5.12 `commercial-hero` — [/enterprise hero, menu]
**Must fix:** today it is a US campus with US road markings.
```
Aerial drone photograph at sunrise of a large manufacturing plant in the Patancheru industrial area near Hyderabad: long galvalume metal roofs covered edge to edge with neat rows of solar panels that follow the roof slope, service walkways between rows, trucks at a loading bay, dry Deccan scrubland and granite outcrops around, soft morning haze.
```
**Alt:** Aerial view of a factory with its metal roofs covered in rows of solar panels at sunrise.

### 5.13 `commercial-industrial` — [/enterprise "Lower operating costs", menu]
```
Roof-level view along a factory's trapezoidal galvalume roof with long rows of solar panels on low rail-less mounts. A technician in a hard hat and safety harness walks the service walkway, seen from behind. Bright morning light; industrial sheds and a water tower in the distance.
```
**Alt:** A technician walking between long rows of solar panels on a factory roof.

### 5.14 `commercial-campus` — [menu]
```
Evening view of a glass office block in HITEC City, Hyderabad: its rooftop carries tilted solar arrays on elevated structures beside a green roof garden; neighbouring towers lit; soft dusk sky.
```
**Alt:** Office tower rooftop with solar arrays and a roof garden at dusk.

### 5.15 `studio-estate` — [Design Studio "Estate" view, technology]
```
Top-down drone photograph at noon of a large estate home with several flat roofs, each carrying neat parallel rows of black solar panels, a pool, lawns and a curving driveway — reads like a site plan.
```
**Alt:** Top-down view of an estate's flat roofs covered in neat rows of solar panels.

### 5.16 `og-image` — [social previews]
1200 × 630 crop of the approved `home-hero`, with safe margins; no text on the image.

---

## 6. Reject an image if any of these is true

- Panels of different sizes, merged, warped, floating, or tilted in different directions; rails that go nowhere.
- Shadows disagree with the sun; reflections impossible.
- Any text, gibberish signage, logos, licence plates.
- Foreign cues: snow, shingle roofs, US streets or markings, left-hand-drive cars, ocean cliffs.
- An "outage" scene with any lit streetlight or lit neighbour.
- Plastic CGI look, oversaturated sky, glowing bloom, over-sharpened edges.
- Distorted hands or faces.
- A product that looks like a TV, tablet, server rack or a known brand's battery.
- Busy top third (headline collides) or bright lower quarter (stat dock unreadable).
- Mobile version shows a different house than desktop.
- Alt text describes anything not visible in the image.

## 7. Honesty line (keeps "no fake details" true)

- On `/about-this-project`: "Visuals are AI-generated concept renders, art-directed by [your name]."
- Never caption a render as a real project ("WAVENOX installation in Jubilee Hills"). Alt text simply describes what is visible.
