---
title: "Geothermal Power Plants: Dry Steam, Flash and Binary Cycles"
description: "How geothermal power works: dry steam, single and double flash, and binary cycle plants — operating principles, advantages and limits, plus a worked single-flash calculation."
category: "Power Plant Engineering"
categorySlug: power-plants
tags: [geothermal power, flash steam, binary cycle, dry steam, renewable energy]
date: 2026-10-09
---

Geothermal energy is heat acquired from the earth. Temperature rises roughly 3 °C per 100 m — about 25 °C per kilometre — so deep wells reach fluid hot enough to drive a turbine. It is baseload renewable power: no fuel, minimal land, steady output.

## A short history

The world's first geothermal power plant operated at Larderello, Italy — first output in 1904 lit four light bulbs; 5 MW by 1915; the field now produces on the order of 545 MW. Wairakei, New Zealand followed in 1958. The Philippines, sitting on the Pacific Ring of Fire, became one of the largest producers: Tiwi and Mak-Ban at roughly 330 MW each, Tongonan and Palimpinon–Dauin around 112 MW each. Tectonically active margins put the heat closer to the surface — about 90% of earthquakes occur along the Pacific rim.

## The three working principles

### 1. Dry steam

Steam is generated directly in the reservoir and piped to the turbine. Exhaust goes to a condenser; **condensate is reinjected through an injection well** while production wells draw fresh fluid. Returning the fluid to the reservoir is not optional — it maintains reservoir pressure and heat, and prevents surface subsidence.

### 2. Flash steam

Hot water at high pressure is pumped from depth into a **flash tank** at much lower pressure. The pressure drop causes a fraction of the water to "flash" into steam; the steam drives the turbine and the brine is reinjected.

- **Single flash** — one throttling stage separates saturated liquid and vapor. The most common configuration worldwide (~29% of plants, ~43% of capacity).
- **Double flash** — a second flasher expands the first flash's liquid brine again, recovering more vapor for about **25% more power** at the cost of more complex operation and maintenance.

### 3. Binary cycle

Geothermal fluid never contacts the turbine. It is pumped through a heat exchanger where it boils a **secondary working fluid with a much lower boiling point** (isobutane/isopentane). The closed loop flashes, drives the turbine and condenses. Lower resource temperatures become usable, and non-condensables never reach the turbine.

## Advantages and limits

**Advantages:** no fuel purchase, no combustion pollution, small land footprint, reliable capacity factor.

**Disadvantages:** geothermal fields are location-specific (drilling is the expensive, risky part), and initial construction cost is high.

## Worked example: single-flash plant

> A single-flash separator receives water at 204 °C; separator pressure 1.04 MPa; condenser at 34 kPa; turbine polytropic efficiency 0.75. Find the well-water mass flow needed for 50 MW output.

The state points:

```text
State 1: well water @ 204 °C       h1 = hf at 204 °C
State 2: after throttling to 1.04 MPa   two-phase; x2 from h1 = hf + x2·hfg
State 3: saturated vapor at 1.04 MPa   h3 = hg at 1.04 MPa
State 4: expansion to 34 kPa with ηp = 0.75
State 5: condensate at 34 kPa      h5 = hf
State 6: pumped reinjection water
```

Separation gives vapor fraction `x2`; the turbine expands only that vapor, so specific work is `(h3 − h4)·x2` per kilogram of well fluid. Dividing 50 MW by that specific work gives the required `mg`. Two facts drive the design: **only the flashed vapor produces work**, and **the condenser pressure fixes the expansion end state** — both visible directly on the [T–s steam tables and chart](/steam-tables).

## Ties to the rest of the plant

Below the flash point, geothermal plant engineering converges with conventional steam plant practice: the same condenser physics as the [Rankine cycle](/guides/rankine-cycle-steam-power-plant), the same wet-exit concerns that [reheat](/guides/reheat-regenerative-rankine-cycle) addresses in larger units, and where the resource is used for direct heating or absorption cooling, the [absorption refrigeration cycle](/guides/absorption-steam-jet-refrigeration).