---
title: "Industrial Plant Solved Problems: Drying, Moisture and Compressor Staging"
description: "Worked industrial plant problems: adiabatic dryer air duty, bone-dry weight and regain calculations for hygroscopic materials, and work saved by two-stage air compression."
category: "Industrial Plant Systems"
categorySlug: industrial-systems
tags: [drying problems, regain, bone dry weight, compressed air, staging, worked examples]
date: 2026-10-23
---

Four problems from the industrial plant course: two on drying and moisture in solids, one on dryer air duty, one on compressor staging. Theory: [compressed air systems](/guides/compressed-air-systems) and [cold storage and ice plant design](/guides/cold-storage-ice-plant-product-load).

---

## Problem 1 — Adiabatic dryer air duty

> 228 kg of dry air per hour is saturated at 5 °C, then heated to 120 °C, passed through an adiabatic dryer and discharged at 60 °C. Find: (a) water in the air before heating, (b) water in the air leaving, (c) water evaporated from the material, (d) RH of the leaving air, (e) volume of the air before drying.

**State 0 — saturated at 5 °C:**

```text
Pv = Psat(5 °C) = 0.872 kPa
ω0 = 0.622 × 0.872 / (101.325 − 0.872) = 0.00540 kg/kg
(a) water in = 228 × 0.00540 = 1.23 kg/h
```

**State 1 — heated to 120 °C (humidity unchanged):**

```text
h1 = 1.0062 × 120 + 0.00540 × 2706.3 = 135.4 kJ/kg
```

**State 2 — discharged at 60 °C, adiabatic (`h2 = h1`):**

```text
135.4 = 1.0062 × 60 + ω2 × 2608.8  →  ω2 = 0.02874 kg/kg
(b) water out  = 228 × 0.02874 = 6.55 kg/h
(c) evaporated = 6.55 − 1.23 = 5.32 kg/h
```

**(d) Leaving RH:**

```text
Pv = ω2·Pt/(0.622 + ω2) = 4.475 kPa ; Psat(60 °C) = 19.94 kPa
RH = 4.475 / 19.94 = 22.4%
```

**(e) Volume before drying** (at the 120 °C dryer inlet):

```text
v1 = 0.2871 × 393 / (101.325 − 0.872) = 1.123 m³/kg
V = 228 × 1.123 = 256 m³/h
```

**Reading it:** the air leaves at only 22% RH — enormous remaining capacity. Drying was limited by the material, not the air; a cooler discharge would mean the air was working harder per kilogram.

---

## Problem 2 — Bone-dry weight and regain

> A 10 kg sample has a bone-dry weight (BDW) of 8.5 kg. After processing the material has a regain of 20%. How much product weight appears per kilogram of the original material?

**Solution.** Regain is moisture as a percentage of **bone-dry weight** (not gross weight):

```text
BDW = 8.5 kg          (original moisture = 1.5 kg)
processed weight = 8.5 × 1.20 = 10.2 kg per 10 kg original
per kg of original → 10.2 / 10 = 1.02 kg
```

**Reading it:** the material *gained* 0.2 kg by re-equilibrating with room air. Hygroscopic materials — wood, leather, paper, tobacco, coconut and rice husk — never stay at the weight you measured yesterday.

---

## Problem 3 — Moisture migration with changing RH

> Raw cotton is stored at 29 °C and 50% RH (regain 6.6%), then passes through a weaving room at 31 °C and 70% RH (regain 8.1%). (a) What is the moisture in 200 kg of stored cotton? (b) How much cloth appears from 200 kg of stored cotton, neglecting process losses?

**Solution.**

```text
(a) BDW = 200 / (1 + 0.066) = 187.6 kg  →  moisture = 200 − 187.6 = 12.4 kg
(b) weight in weaving room = 187.6 × (1 + 0.081) = 202.8 kg
```

**Reading it:** 200 kg of stored cotton emerges as ~203 kg of cloth — it *absorbed* 2.8 kg of water from the humid weaving room. Air conditioning the weave room is a product-weight decision, not just a comfort one. Humidity control on the psychrometric side: [psychrometrics fundamentals](/guides/psychrometrics-fundamentals).

---

## Problem 4 — Work saved by two-stage compression

> Compress 8.5 m³/min of air from 98.56 kPa to 985.6 kPa with `n = 1.3`. What is the saving with two-stage compression and perfect intercooling?

**Solution.**

```text
Single stage:
W = [n/(n−1)]·P1·V1·[(P2/P1)^((n−1)/n) − 1]
  = (1.3/0.3) × 98.56 × 8.5 × [10^0.2308 − 1] = 2,540 kJ/min

Two stages at Px = √(P1·P2) = 311.7 kPa (ratio √10 = 3.162 per stage):
stage 1 (V = 8.5 m³/min)       = 1,094 kJ/min
stage 2 (V = 8.5 × 98.56/311.7 = 2.68 m³/min) = 1,092 kJ/min
total = 2,186 kJ/min

saving = (2,540 − 2,186) / 2,540 ≈ 14%
```

Equal work per stage (1,094 vs 1,092 kJ/min) confirms the intermediate pressure was chosen correctly — the geometric mean of the pressures is what makes the ratios equal.

---

## Where to go next

- The psychrometric side of every drying problem: [air conditioning processes](/guides/air-conditioning-processes-psychrometric-chart)
- Sizing the machine behind Problem 4: [refrigeration compressor performance](/guides/refrigeration-compressor-performance) covers volumetric and mechanical efficiency in depth
- The full-load version of cold room design: [cold storage and ice plant](/guides/cold-storage-ice-plant-product-load)