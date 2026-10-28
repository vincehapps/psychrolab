---
title: "Refrigeration Solved Problems: Carnot, Vapor Compression and Two-Stage"
description: "Fully worked refrigeration problems: reversed Carnot COP and power, vapor compression cycle with R-12 and ammonia, ice-making duty, and two-stage compression savings."
category: "Refrigeration Systems"
categorySlug: refrigeration
tags: [refrigeration problems, COP, reversed Carnot, vapor compression, two-stage, worked examples]
date: 2026-10-21
---

Six worked problems covering the cycle analysis from benchmark to machine. Theory: [vapor compression cycle](/guides/vapor-compression-refrigeration-cycle) and [multi-pressure systems](/guides/multi-pressure-refrigeration-systems). Remember `1 TR = 3.52 kW`.

## Problem 1 — Reversed Carnot: power and capacity

> A reversed Carnot refrigeration system operates between −25 °C and 72 °C and rejects 6000 kJ/min at the condenser. Find the power input and the refrigerating effect in TR.

**Solution.**

```text
TL = 248 K, TH = 345 K, QR = 6000 kJ/min
ΔS = QR / TH = 6000/345 = 17.39 kJ/(min·K)
Wnet = (TH − TL)·ΔS = 97 × 17.39 = 1687 kJ/min = 28.1 kW
QA  = TL·ΔS = 248 × 17.39 = 4313 kJ/min = 71.9 kW = 20.4 TR
```

Check: `Wnet = QR − QA = 6000 − 4313` ✓.

## Problem 2 — Reversed Carnot from a given power

> A reversed Carnot system holding a 250 K space needs 1.2 kW per TR. Find COP, the heat-rejection temperature and the heat rejected.

**Solution.**

```text
COP = QA/W = 3.52/1.2 = 2.93
COP = TL/(TH − TL) → 2.93 = 250/(TH − 250) → TH = 335.3 K
QR = QA + W = 3.52 + 1.2 = 4.72 kW
```

## Problem 3 — Vapor compression, R-12

> A simple saturated R-12 cycle runs at −5 °C evaporating, 40 °C condensing, capacity 100 kW. Find compressor work, heat rejected, COP and refrigerant volume flow.

**Solution.** From R-12 tables: `h1 = hg(−5 °C) = 349.3`, `h3 = h4 = hf(40 °C) = 238.5`, `h2 = 372 kJ/kg` (at `Pc`, `s2 = s1`), `v1 = 0.06496 m³/kg`.

```text
mR = 100 / (349.3 − 238.5) = 0.9025 kg/s
Wc = 0.9025 × (372 − 349.3) = 20.5 kW
QR = 0.9025 × (372 − 238.5) = 120.5 kW
COP = 100 / 20.5 = 4.88
V1 = 0.9025 × 0.06496 = 0.0586 m³/s
```

Energy check: `100 + 20.5 = 120.5` ✓.

## Problem 4 — Ice plant duty with ammonia

> An ammonia cycle (−20 °C evaporating, 35 °C condensing) makes 1000 kg of ice at −12 °C from water at 29 °C in 20 hours, with heat losses of 20%. Find mass flow, condenser duty, compressor power and COP.

**Solution.** Cooling load first:

```text
Q = 1×4.187×29 + 335 + 2.094×12 = 121.4 + 335 + 25.1 = 481.6 kJ/kg
actual (1.2×): 577.9 kJ/kg → QA = 1000×577.9/72,000 s = 8.03 kW
```

From ammonia tables: `h1 = hg(−20 °C) = 1437.23`, `h3 = h4 = hf(35 °C) = 366.07`, `h2 = 1736 kJ/kg`.

```text
mR = 8.03 / (1437.23 − 366.07) = 0.0075 kg/s
QR = 0.0075 × (1736 − 366.07) = 10.3 kW
Wc = 0.0075 × (1736 − 1437.23) = 2.24 kW
COP = 8.03 / 2.24 = 3.58
```

## Problem 5 — Single stage vs two-stage with flash intercooling

> An NH3 system delivers 210 kW at −20 °C evaporating, condensing at 1431 kPa. Compare a single compressor against two-stage compression with intercooling and flash gas removal at 555 kPa.

**Solution.**

```text
Single stage:
m1 = 210/(1437.23 − 375.85) = 0.198 kg/s
Wc = 0.198 × (1750 − 1437.23) = 61.93 kW    COP = 3.40

Two stage (h2 = 1578 at 555 kPa; h3 = 1468.78 sat; h4 = 1610 at 1431 kPa; h8 = 232.50):
m1 = 210/(1437.23 − 232.50) = 0.1743 kg/s
intercooler balance → m3 = 0.2146 kg/s
Wc = 0.1743×(1578 − 1437.23) + 0.2146×(1610 − 1468.78) = 54.84 kW
COP = 3.83      saving = 11.5%
```

**Reading it:** the second stage moves *more* refrigerant than the first (flash gas joins it), yet total work falls — equal pressure ratios plus complete intercooling are what make staging pay.

## Problem 6 — Work comparison at fixed temperatures

> A reversed Carnot cycle rejects 1000 kW at 340 K while absorbing at 250 K. Find COP, power and refrigerating effect.

**Solution.**

```text
COP = 250/(340 − 250) = 2.78
ΔS = 1000/340 = 2.941 kW/K ; QA = 250 × 2.941 = 735.3 kW
W = 1000 − 735.3 = 264.7 kW
```

## Challenge problem

The course leaves this one open — try it before checking the method:

> A two-stage ammonia system of 150 kW capacity operates at −40 °C evaporating, 30 °C condensing, intermediate pressure 291.57 kPa. Discharge from the low-stage bubbles through a flash intercooler to saturation before the high stage; condenser liquid is subcooled to 25 °C, flashes into the interstage cooler and leaves at −10 °C. Actual volumetric efficiencies are 85% (LP) and 80% (HP), isentropic compression both stages. Find total piston displacement (L/min), total compressor power, condenser cooling water at a 12 °C rise with 90% transfer efficiency, and COP.

**Method:** draw the schematic and Ph diagram first; fix all enthalpies from the tables; split the mass flows at the flash intercooler; use `VD = V1/ηva` per stage. Answers verified against [multi-pressure systems](/guides/multi-pressure-refrigeration-systems), where the 210 kW version of the same layout is fully solved.

Continue with [refrigeration compressor performance](/guides/refrigeration-compressor-performance) for the efficiency chain between these cycle numbers and shaft power.