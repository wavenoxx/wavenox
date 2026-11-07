# Step 6 preliminary roof assessment

`RoofSketcher` continues to use `calculateRoofSketcherGeometry()` in Step 4 and `validateRoofFeasibility()` in Step 3. Module wattage/footprint, clear area per kW and regional yield remain centralized in existing product/solar/regulatory configuration.

Supported manual inputs are approximate gross area, measured rectangle length/width, an L-shape corner cutout, parapet setback, tank/obstacle footprint, maintenance allowance and intended orientation. Inputs and defaults are visibly distinguished from a surveyed plan.

- Area-only mode retains the explicitly disclosed square-perimeter approximation.
- Rectangle mode uses gross area L×W and exact inset area max(0,L−2s)×max(0,W−2s), avoiding repeated corner deduction.
- L-shape mode subtracts one corner rectangle. Subtracting the full cutout from the inset outer rectangle is conservative near the inner corner.
- Deductions clamp usable area at zero. Invalid dimensions disable application. Independent tests cover dimensions, cutouts, complete obstruction and nonfinite inputs.
- Capacity remains an area-based preliminary estimate using the existing allowance. The module illustration is an approximate count, explicitly not a scaled placement plan. Obstacle location, narrow dimensions, tilt, shade and row layout can further reduce capacity.
- Orientation is a local review input, not a validated generation correction. Unknown DISCOMs withhold regional generation.

The previous illustrative satellite presets have been removed from this planner. No licensed, validated customer-imagery/geometry service is configured; no location is requested or transmitted. There is no automatic detection, satellite shading, LiDAR or georeferenced measurement claim.

A physical survey must establish structure, wind loading, waterproofing, access, shading, electrical safety, usable geometry and DISCOM hosting approval. Applying usable area uses the existing Studio roof constraints and requires explicit customer action.
