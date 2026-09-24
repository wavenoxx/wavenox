# WAVENOX Photographic Shot List & Showroom Guidelines

Every marketing section across WAVENOX is anchored by real, image-led photography representing authentic Indian clean-technology environments. We adhere to the restraint and calm of minimal showrooms:

- **No CGI glows or fictional 3D renders**
- **No fake hexagonal solar cells**
- **No cluttered text badges, icon tiles, or colored chips superimposed on images**
- **Indian architectural and climatic reality**: Flat RCC roofs, high ambient heat, terrace utility, urban and semi-urban architecture in Hyderabad, Bengaluru, and Telangana/Andhra.

---

## The 8 Master Showroom Shots

| Slug              | Scene & Description                                                                                             | Architectural / Climatic Context                                                                         | Focus & Subject                                                                                    | Aspect & Crop                                            |
| :---------------- | :-------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| `home-hero`       | Contemporary Jubilee Hills / Bengaluru villa with flat RCC roof and low-profile monocrystalline bifacial array. | Early morning golden hour light, clean rooflines, residential setting.                                   | Monocrystalline solar panels sitting neatly on reinforced terrace mounts without ugly scaffolding. | 16:9 Desktop (1920×1080), 4:5 Mobile Portrait (800×1000) |
| `home-design`     | Architectural terrace detail shot showing concealed mounting hardware and clean black frames.                   | Clean elevated perspective showing finished structural integrity.                                        | HDG anodized aluminium rails, hidden cable trays, water-shedding pitch.                            | 16:9 Desktop (1920×1080), 4:5 Mobile Portrait (800×1000) |
| `home-outage`     | Resilient evening home lighting during a neighborhood power disruption.                                         | Twilight / dusk street scene where neighborhood is dark while the WAVENOX home stays warmly illuminated. | Seamless switchover to Omnigrid battery backup without flickering.                                 | 16:9 Desktop (1920×1080), 4:5 Mobile Portrait (800×1000) |
| `home-heat`       | Direct high-noon Indian sunlight hitting N-type TOPCon bifacial cells.                                          | 42°C summer afternoon ambient condition in Deccan plateau.                                               | Multi-busbar bifacial cells producing continuously through extreme temperature coefficients.       | 16:9 Desktop (1920×1080), 4:5 Mobile Portrait (800×1000) |
| `home-final`      | Dusk terrace lounge under elevated solar pergola canopy.                                                        | Evening skyline, warm accent lighting, functional living space beneath array.                            | Usable lifestyle terrace space under solar shade structure.                                        | 16:9 Desktop (1920×1080), 4:5 Mobile Portrait (800×1000) |
| `omnigrid-hero`   | Graphite wall-mounted Omnigrid battery unit in modern utility space or parking bay.                             | Minimal architectural interior / covered car porch, clean cable conduits.                                | Omnigrid unit with subtle single-line LED state indicator.                                         | 16:9 Desktop (1920×1080), 4:5 Mobile Portrait (800×1000) |
| `homes-hero`      | Independent multi-story residential home with rooftop terrace solar installation.                               | Urban Bengaluru / Hyderabad residential layout with surrounding trees.                                   | Complete residential system powering air conditioners and daily domestic load.                     | 16:9 Desktop (1920×1080), 4:5 Mobile Portrait (800×1000) |
| `commercial-hero` | Multi-megawatt or multi-hundred-kW industrial campus / factory rooftop solar array.                             | Broad industrial park / logistics warehouse with symmetrical solar layout.                               | Commercial grid-tied installation engineered for high daytime manufacturing load.                  | 16:9 Desktop (1920×1080), 4:5 Mobile Portrait (800×1000) |

---

## Technical Image Delivery Pipeline

1. **Source Resolution**: Masters stored in `media-src/` at minimum 2400px width.
2. **Derived Formats**: Generated automatically via `scripts/build-images.mjs` using `sharp`:
   - Modern AVIF: Quality 75, speed 5 (best compression ratio).
   - Modern WebP: Quality 80.
   - Fallback JPEG: Quality 82, progressive scan, mozjpeg-optimized.
3. **Responsive Width Breakpoints**:
   - `640w`, `1080w`, `1600w`, `2400w`
4. **Mobile Specific Crops**:
   - Dedicated `*-mobile` portrait crops (aspect 4:5) for viewports `(max-width: 768px)` to keep key subjects centered on vertical screens.
5. **Strict File Size Budgets**:
   - Hero AVIF at 1600w: **≤ 250 KB**
   - Secondary Panels AVIF at 1600w: **≤ 180 KB**
   - Zero Cumulative Layout Shift (CLS) via explicit dimension attributes and container aspect ratios.
