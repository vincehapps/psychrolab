---
title: "Steam Power Plant Solved Problems: Rankine, Reheat, Regenerative"
description: "Four fully worked steam power plant problems: simple Rankine thermal efficiency, reheat turbine work and efficiency, and open and closed feedwater heater extraction fractions."
category: "Power Plant Engineering"
categorySlug: power-plants
tags: [Rankine problems, reheat, regenerative cycle, feedwater heater, thermal efficiency, worked examples]
date: 2026-10-22
---

Four cycle problems from simple to regenerative. Background in [Rankine cycle fundamentals](/guides/rankine-cycle-steam-power-plant) and [reheat and regenerative cycles](/guides/reheat-regenerative-rankine-cycle); state points checked against the [saturated steam tables and T–s chart](/steam-tables).

Universal moves: `qin = h2 − h1`, `wt = h2 − h3`, `wp ≈ v·ΔP`, `η = (wt − wp)/qin`, `W = m·wnet`.

---

## Problem 1 — Simple ideal Rankine cycle

> 3.0 MPa and 50 kPa limits, turbine inlet 400 °C, steam flow 25 kg/s. Find thermal efficiency and net power.

**State points.**

```text
State 2: 3 MPa, 400 °C (superheated) → h2 ≈ 3,231 kJ/kg, s2 ≈ 6.92 kJ/(kg·K)
State 3: s3 = s2 at 50 kPa → x3 = (6.92 − 1.091)/6.504 ≈ 0.90 → h3 ≈ 2,434 kJ/kg
State 4: hf at 50 kPa = 340.5 kJ/kg
State 1: h1 = 340.5 + 0.001030×(3000 − 50) ≈ 343.6 kJ/kg
```

**Results:**

```text
qin  = 3231 − 343.6 ≈ 2,878 kJ/kg          (course value: 2,878.25)
wt   = 3231 − 2434 ≈ 798 kJ/kg
wnet ≈ 795 kJ/kg → W = 25 × 0.795 ≈ 20 MW  (course value: 20.5 MW)
ηth  ≈ 28.4%
```

**Reading it:** turbine exit quality near 0.90 means roughly 10% liquid by mass at the last stage — wet but acceptable. Efficiency sits in the high-20s, the classic simple-cycle range.

---

## Problem 2 — Reheat cycle

> Steam enters the HP turbine at 6 MPa, 400 °C, exits at 2 MPa, is reheated to 400 °C, then expands to 20 kPa. Find turbine work and cycle efficiency.

**State points** (course tables):

```text
State 2: 6 MPa, 400 °C    h2 = 3177.2   s2 = 6.5408
State 3: 2 MPa, s3 = s2   h3 = 2900.2
State 4: 2 MPa, 400 °C    h4 = 3247.6   s4 = 7.1271
State 5: 20 kPa, s5 = s4  x5 = (7.1271 − 0.832)/7.0765 = 0.890 → h5 = 2349.3
State 6: hf at 20 kPa     h6 = 251.4
```

**Work and heat:**

```text
wt = (3177.2 − 2900.2) + (3247.6 − 2349.3) = 1,175.3 kJ/kg
wp ≈ 0.001017 × (6000 − 20) = 6.1 kJ/kg   → h1 = 257.5
qin = (3177.2 − 257.5) + (3247.6 − 2900.2) = 3,267.1 kJ/kg
ηth = (1175.3 − 6.1) / 3267.1 = 35.8%
```

**Reading it:** LP exit quality is 0.890 — the reheat lifted it well above the ~0.80 a single expansion to 20 kPa would give, and efficiency rose from ~28% to ~36% simultaneously. Both promises of reheat, in one problem.

---

## Problem 3 — Regenerative cycle, open feedwater heater

> Ideal regenerative Rankine with one open feedwater heater: 15 MPa and 600 °C turbine inlet, condenser 10 kPa, steam extracted at 1.2 MPa. Find extraction fraction, qin, turbine work and efficiency.

**Method:** energy balance around the open heater with extraction fraction `y`:

```text
y·h_extraction + (1 − y)·h_saturated_liquid_at_extraction = h_feedwater_exit
```

**Results (course data):**

```text
y         ≈ 0.25        (about a quarter of the steam leaves early)
qin       ≈ 2,700 kJ/kg
wt        ≈ 1,260 kJ/kg
ηth       ≈ 46%
```

**Reading it:** efficiency jumps to the mid-40s — from roughly 34% for the simple cycle at the same 15 MPa conditions. Sweeping the extraction pressure from 1.2 to 2.7 MPa in the course data moves efficiency by less than a percentage point, so extraction pressure is chosen for plant layout, not micro-optimisation.

---

## Problem 4 — Regenerative cycle, closed feedwater heater

> Ideal regenerative cycle with a closed FWH: turbine inlet 10 MPa and 525 °C, condenser 15 kPa, extraction at 1,000 kPa, feedwater enters the boiler at 160 °C. Find extraction fraction, heat input and efficiency.

**Method:** no mixing in a closed heater — separate balances for the feedwater side and the extraction side, with the drain throttled back to the condenser (`h7 = h8`).

**Results (course data):**

```text
y    = 0.216      (roughly a fifth extracted)
qin  = 2,756 kJ/kg
wt   = 1,132 kJ/kg
ηth  = 40.6%
```

**Reading it:** the closed heater beats the simple cycle (~34%) but trails the open-heater configuration here — fewer pumps, but no deaeration and a thermodynamically weaker feedwater exit temperature.

---

## Comparison to keep on the wall

| Cycle | ηth |
|---|---|
| Simple Rankine, 10 MPa / 50 kPa | ~34% |
| Reheat, 6 MPa / 20 kPa | 35.8% |
| Reheat, 25 MPa / 20 kPa | 41.6% |
| Regenerative, closed FWH | 40.6% |
| Regenerative, open FWH | ~46% |

Each step either raises the average heat-addition temperature or drops the average heat-rejection temperature — the only two levers the cycle has.

More cycles in the wild: [geothermal power plants](/guides/geothermal-power-plant-cycles) reuse the same condenser and expansion physics without the boiler.