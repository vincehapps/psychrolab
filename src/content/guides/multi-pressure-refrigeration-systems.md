---
title: "Multi-Pressure and Two-Stage Refrigeration Systems"
description: "When one compressor is not enough: flash tanks, intercoolers, two-stage compression with flash gas removal, cascade systems and the conditions for minimum compression work."
category: "Refrigeration Systems"
categorySlug: refrigeration
tags: [multi-pressure system, two-stage compression, intercooler, flash tank, cascade refrigeration]
date: 2026-10-07
---

A multi-pressure refrigeration system is one with two or more low-side pressures — or a pressure split handled in stages. The standard configurations:

- One compressor, two evaporators
- Two compressors, one evaporator
- Two compressors, two evaporators
- **Cascade systems** for wide temperature spans

## Why stage at all

Between a deep freezer (−20 °C evaporator) and a 30 °C condenser, a single compressor faces a pressure ratio that pushes clearance re-expansion, discharge temperature and specific work far up. Splitting the lift gives:

- Lower discharge temperatures
- Higher volumetric efficiency at each stage
- **Flash gas removal** — vapor separated in a flash tank never re-circulates through the evaporator
- **Intercooling** — cooler, denser gas into the second stage, so the same mass costs less work

## Minimum work conditions

For multi-stage compression to actually deliver savings:

1. **Equal pressure ratio per stage** — `Pd/Ps` identical across stages.
2. **Perfect intercooling** — the gas returns to its original temperature between stages.
3. **Isentropic processes** within each stage.
4. **Equal work per stage.**

## Building blocks

### Flash tank

Throttled refrigerant enters the tank; vapor is drawn off as flash gas to the compressor, saturated liquid feeds the low-temperature evaporator. Mass and energy balance on the mixing:

```text
m6 + m8 = m1
m6·h6 + m8·h8 = m1·h1
```

### Intercooler

Removes the heat of the first stage. In practice it cools the gas (increasing density so more air or refrigerant is compressed per stroke for the same work), protects the machine from overheating, and cuts energy consumption.

## Worked example: one compressor → two stages

> An NH3 system delivers 210 kW at −20 °C evaporating, condensing at 1431 kPa. Revised to two-stage compression with intercooling and flash gas removal at an intermediate pressure of 555 kPa. Compare power and COP.

**Single stage:**

```text
h1 = hg(−20°C) = 1437.23 ; h2 = 1750 kJ/kg ; h3 = h4 = 375.85
m1 = 210 / (1437.23 − 375.85) = 0.198 kg/s
Wc = 0.198 × (1750 − 1437.23) = 61.93 kW    COP = 3.40
```

**Two stage** (first stage to 555 kPa, intercooled to saturation, second stage to 1431 kPa):

```text
h2 = 1578 (555 kPa, s2 = s1) ; h3 = hg(555 kPa) = 1468.78
h4 = 1610 (1431 kPa, s4 = s3) ; h8 = hf(555 kPa) = 232.50
m1 = 210 / (1437.23 − 232.50) = 0.1743 kg/s
intercooler balance: 0.1743·(1578 − 232.50) = m3·(1468.78 − 375.85) → m3 = 0.2146 kg/s
Wc = 0.1743·(1578 − 1437.23) + 0.2146·(1610 − 1468.78) = 54.84 kW
```

| | Single stage | Two stage |
|---|---|---|
| Refrigerating effect | 210 kW | 210 kW |
| Compressor work | 61.93 kW | 54.84 kW |
| COP | 3.40 | 3.83 |

**11.5% work saved** — at the same cooling duty. Note the second stage moves a *larger* mass (`m3 > m1`) because the intercooler also carries the flash gas.

## Configurations in practice

- **Two evaporators, one compressor** — different temperature zones (chiller + freezer) on one machine; each evaporator throttles to its own pressure, and the suction picks up both at the higher suction condition through a back-pressure arrangement.
- **One evaporator, two compressors** — high and low stages with flash tank/intercooler between them; the balance `m2·h2 + m6·h6 = m3·h3 + m7·h7` with `m2 = m7`, `m3 = m6` fixes the flows.
- **Cascade** — two fully separate loops meeting in a heat exchanger: a low-temperature refrigerant (ammonia, CO₂) rejects into a high-temperature one (R-134a, R-404A). Used when one refrigerant cannot span the whole range economically.

Staging pays exactly when the pressure ratio is high — see [compressor performance](/guides/refrigeration-compressor-performance) for the clearance-volumetric relationship it exploits, and the [cold storage and ice plant guide](/guides/cold-storage-ice-plant-product-load) for a plant where these configurations show up together.