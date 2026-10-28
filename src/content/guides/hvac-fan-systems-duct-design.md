---
title: "HVAC Fan Systems and Air Duct Design"
description: "Fan types, fan laws and fan head calculations, plus duct design by the velocity reduction and equal friction methods — velocities, pressure classes and index run sizing explained."
category: "Air Conditioning & Ventilation"
categorySlug: air-conditioning
tags: [fans, duct design, fan laws, velocity reduction method, equal friction method, index run]
date: 2026-10-05
---

Air distribution has two halves: the **fan** that provides the pressure, and the **duct system** that spends it. This guide covers fan selection, the fan laws, and the two classic duct sizing methods.

## Fans, blowers and compressors

The dividing line is pressure ratio:

| Machine | Pressure ratio |
|---|---|
| Fan | up to 1.11 |
| Blower | 1.11 to 1.2 |
| Compressor | above 1.2 |

A fan is a device that produces a flow of air with pressure differentials below about 28 in. water gage at sea level.

## Fan types

**Centrifugal** (air flows radially through the impeller) — preferred for comfort HVAC because of quiet, efficient operation at comparatively high pressure:

- **Forward-curved** — medium pressure, high flow, power rises continuously with flow. Low-pressure HVAC and packaged units.
- **Radial** — self-cleaning, high structural strength, high speed and pressure. Industrial and dust-laden or mist-laden gases.
- **Backward-curved** — high pressure, high flow, highest efficiency; power *falls* as flow rises past peak efficiency, and it is the quietest. Forced-draft and general HVAC.

**Axial** (air flows through the blade row) — large volumes where higher noise is acceptable: industrial ventilation, engine rooms, steam exhaust. Propeller, tubeaxial and vaneaxial variants exist.

## The fan energy equation

```text
hF = (P2 − P1)/γ + (v2² − v1²)/2g + (z2 − z1) + hL     fan head [m]
FP = Q · γ · hF                                          fan power [kW]
ηF = FP / BP × 100                                       fan efficiency
```

`Q` is volume flow, `γ` the specific weight of air, `hL` system head losses. A worked field example: a fan moving 9.5 m³/s with inlet −2.54 cm w.g. and discharge +7.68 cm w.g. through 1.6 m² inlet and 0.87 m² outlet ducts develops about 89.5 m of air head (≈ 4.2 in. w.g.), absorbs 10 kW on the air, and with 12.5 kW input runs at 80% efficiency.

## Fan laws

For a fixed fan size and air density, changing speed `N`:

```text
Q2/Q1   = N2/N1        flow
h2/h1   = (N2/N1)²     pressure
P2/P1   = (N2/N1)³     power
```

Example: a fan moving 340 m³/min at 25.4 mm w.g. and 3 kW, sped up from 400 to 440 RPM, becomes 374 m³/min at 30.7 mm w.g. drawing 4 kW. The cubic power law is why variable-speed drives save energy: halving speed cuts power to one eighth.

Selection also weighs noise, rotational speed, air-stream characteristics, temperature range, operating-condition variation, space constraints, purchase and operating cost, and operating life.

## Duct design: what we produce

1. Duct dimensions (size and shape) for each run
2. Required fan power
3. Damper placements and openings

A duct system must meet the airflow from the load calculation, be economical in first cost, operating cost and space, and keep noise acceptable.

### Layout vocabulary

- **Run** — a continuous path from fan to an outlet (e.g. A–C–D–E to zone 2).
- **Index run** — the run with the highest pressure drop, usually the longest. It determines fan pressure; all other runs are balanced back to it with dampers.

### Design rules

1. Route air as directly as possible.
2. Avoid sudden direction changes; use turning vanes where unavoidable.
3. Diverging sections gradual — divergence angle ≤ 20°.
4. Aspect ratio as close to 1.0 as possible, never exceeding 4.
5. Keep velocities within noise limits.
6. Use smooth duct material to cut friction.

### Pressure classes

- **Low** — velocity ≤ 10 m/s, static ≤ 5 cm w.g.
- **Medium** — velocity ≤ 10 m/s, static ≤ 15 cm w.g.
- **High** — velocity > 10 m/s, static 15–25 cm w.g.

Higher velocity means smaller ducts and lower first cost, but higher pressure drop, larger fan power, and more noise attenuation.

Typical velocities: residences 3–5 m/s, theatres 4–6.5 m/s, restaurants 7.5–10 m/s; when unspecified, 5–8 m/s in mains and 4–6 m/s in branches.

## The velocity reduction method

1. Select velocities in main and branch ducts.
2. Find areas from `A = Q/v`; size circular ducts from `D = √(4A/π)`, or fix an aspect ratio for rectangular.
3. Compute friction loss per unit length (friction chart or `Pf/L = 0.002268 · Q^1.852 / D^4.973` in mm w.g. per metre).
4. Add dynamic losses for bends and fittings (`k · v²/2g`).
5. Select a fan that delivers the total pressure of the index run.
6. Install balancing dampers in each run — index run wide open, others throttled.

**Pros:** guarantees appropriate velocities, simple. **Cons:** resulting duct sizes may be uneconomical in material and space, and fan power may not be optimal — which is what the equal-friction method (select a uniform pressure drop per metre and size every duct from it) trades for.

## Worked sizing sketch

Main duct 4 m³/s at 8 m/s → 0.5 m² (D ≈ 0.80 m); branches at 3 m/s: 1 m³/s → 0.33 m² (D ≈ 0.65 m), 2 m³/s → 0.67 m² (D ≈ 0.92 m). Friction along the index run plus fitting losses plus outlet static pressure then sets the required fan head.

Size your air side alongside the [psychrometric chart](/psych-chart) for supply conditions, run either method through the [duct sizing calculator](/duct-sizing), and see [cooling load calculations](/guides/cooling-load-calculations) for the airflow those ducts must carry.