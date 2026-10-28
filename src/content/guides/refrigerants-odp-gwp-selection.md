---
title: "Refrigerants Explained: Numbering, ODP, GWP and Selection"
description: "Refrigerant numbering rules for halocarbons, hydrocarbons and inorganics, ozone depletion and global warming potential, toxicity, flammability, oil miscibility and material compatibility."
category: "Refrigeration Systems"
categorySlug: refrigeration
tags: [refrigerants, R-134a, ammonia, ODP, GWP, refrigerant selection]
date: 2026-09-16
---

A refrigerant is the fluid that picks up heat by evaporating at low temperature and pressure and gives it up by condensing at a higher temperature and pressure. Choosing one is a multi-variable decision: thermodynamic performance, toxicity, flammability, oil behaviour, material compatibility, and environmental impact all pull in different directions.

## Primary and secondary refrigerants

- **Primary refrigerant** — participates directly in the cycle, alternately absorbing and rejecting heat (R-134a, ammonia, CO₂).
- **Secondary refrigerant** — a liquid that transports chilled energy from the plant to the point of use: brines and antifreezes. The primary stays inside the machine.

## How refrigerants are numbered

**Halocarbons and hydrocarbons** — three digits:

```text
1st digit = number of carbon atoms − 1
2nd digit = number of hydrogen atoms + 1
3rd digit = number of fluorine atoms
```

So R-12 is `011`: one carbon, zero hydrogens... read the leading zero as C−1 = 0, H+1 = 1, three F ⇒ CCl₂F₂ (dichlorodifluoromethane). R-22 (monochlorodifluoromethane, CHClF₂) follows the same rule. A trailing digit after a decimal point indicates an isomer.

**Hydrocarbons** use the same pattern: methane CH₄ is R-50, ethane C₂H₆ is R-170, propane C₃H₈ is R-290.

**Inorganics** — 7 plus the molecular weight: ammonia NH₃ is **R-717**, water H₂O is R-718, carbon dioxide CO₂ is R-744, sulfur dioxide SO₂ is R-764.

## Environmental impact: ODP and GWP

Two numbers dominate regulation:

| Refrigerant | ODP | GWP |
|---|---|---|
| R-11 | 1.00 | 4,750 |
| R-12 | 0.82 | 10,900 |
| R-22 | 0.06 | 1,810 |
| R-124 | 0.03 | 610 |
| R-134a | 0 | 1,430 |
| R-404A | 0 | 3,920 |
| R-407C | 0 | 1,770 |

- **ODP** — ozone depletion potential, relative to R-11. Drives the CFC and HCFC phase-outs.
- **GWP** — global warming potential over a given horizon. R-134a scores zero on ozone but 1,430 on warming, which is why the industry keeps moving: HCFCs (R-22) are being replaced, and HFCs (R-134a, R-404A) are themselves under phase-down in favour of low-GWP alternatives.

## Performance comparison

At evaporating −15 °C and condensing 30 °C:

| Refrigerant | Refrigerating effect (kJ/kg) | COP |
|---|---|---|
| R-11 | 155.4 | 5.03 |
| R-12 | 116.3 | 4.70 |
| R-22 | 162.8 | 4.66 |

High refrigerating effect means less refrigerant mass circulation for the same duty — smaller compressor displacement — while COP decides operating cost. R-22's larger effect but slightly lower COP here shows the two metrics do not move together.

## Safety and handling

- **Toxicity:** R-12 is non-toxic at 20% by volume for two hours of exposure. Ammonia is injurious to lethal at 0.5–1% for half an hour — which is why large ammonia plants live in machine rooms with detection and ventilation.
- **In a leak:** short halocarbonate exposure has negligible effect; prolonged ammonia exposure taints food.

## Oil miscibility

- R-12 — fully miscible with oil: oil returns to the compressor easily.
- R-22 — partially miscible.
- Ammonia — **not** miscible with oil: oil settles in the low spots (evaporator, suction line) and must be drained or purged.

## Material compatibility

- Ammonia attacks copper, brass and other cuprous alloys — use **steel or iron** piping.
- Halocarbons react with zinc — avoid galvanised components in their circuits.

## Putting it together

Selection starts with the application's temperature range and safety context, checks oil behaviour and piping materials against the plant, then filters by ODP/GWP regulations. From there, cycle design takes over: see the [vapor compression cycle](/guides/vapor-compression-refrigeration-cycle) for the analysis and [compressor performance](/guides/refrigeration-compressor-performance) for the machine, or size a cold room directly with the [cold storage and ice plant guide](/guides/cold-storage-ice-plant-product-load).