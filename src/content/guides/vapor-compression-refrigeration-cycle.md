---
title: "The Vapor Compression Refrigeration Cycle Explained"
description: "How the vapor compression refrigeration cycle works: the four processes, Ph and Ts diagrams, COP calculation, subcooling and superheat improvements, with a worked R-12 example."
category: "Refrigeration Systems"
categorySlug: refrigeration
tags: [vapor compression cycle, refrigeration, COP, subcooling, superheat, reversed Carnot cycle]
date: 2026-09-09
---

Refrigeration is the process of removing heat at a low temperature and rejecting it at a relatively higher one. The **vapor compression cycle** is the machine that does it — the workhorse behind food preservation, blast freezing, ice making, chillers and air conditioning.

## The ideal benchmark: reversed Carnot

Before the practical cycle, the theoretical limit. A reversed Carnot cycle between `TL` and `TH` runs four reversible processes: isentropic compression (1–2), isothermal heat rejection (2–3), isentropic expansion (3–4), isothermal heat addition (4–1). Its performance is fixed purely by temperatures:

```text
COP = TL / (TH − TL)
```

Work it through: rejecting 6000 kJ/min between 248 K and 345 K needs `Wnet = (TH − TL)·QR/TH = 28.1 kW` and delivers `QA = TL·QR/TH = 71.9 kW ≈ 20.4 TR`.

Two lessons carry over: COP improves by lowering `TL` and `TH` (colder evaporator, cooler condenser), and no real cycle beats this value. Real machines fall short because they cannot expand liquid efficiently isentropically, and heat exchange is not isothermal.

## The four processes of the vapor compression cycle

```text
1–2  Reversible adiabatic (isentropic) compression    s = const
2–3  Reversible isobaric heat rejection (condenser)   p = const
3–4  Isenthalpic expansion (throttling)               h = const
4–1  Reversible isobaric heat addition (evaporator)   p = const
```

Components: **compressor** (1→2), **condenser** (2→3), **expansion valve** (3→4), **evaporator** (4→1). On the Ph diagram the cycle is a rectangle-ish loop; on the Ts diagram the compression line slopes up into the superheat region and the expansion ends inside the two-phase dome, leaving the refrigerant mostly vapor with some liquid.

## The performance equations

```text
Wc = mR·(h2 − h1)        compressor work [kW]
QA = mR·(h1 − h4)        refrigerating effect at evaporator
QR = mR·(h2 − h3)        heat rejected at condenser
COP = QA / Wc
```

At the expansion valve `h3 = h4`, so the valve does no work and no heat — it just converts pressure into a two-phase mixture: `h3 = hf4 + x4·(hg4 − hf4)`.

## Worked example: simple saturated cycle, R-12

> Evaporating temperature −5 °C, condensing 40 °C, capacity 100 kW. Find compressor work, condenser rejection, COP and refrigerant volume flow.

From R-12 tables:

```text
h1 = hg at −5°C = 349.3 kJ/kg
h3 = h4 = hf at 40°C = 238.5 kJ/kg
h2 = h at Pc, s2 = s1 = 372 kJ/kg
v1 = vg at −5°C = 0.06496 m³/kg
```

Refrigerant flow: `mR = 100 / (349.3 − 238.5) = 0.9025 kg/s`. Then:

```text
Wc = 0.9025 × (372 − 349.3) = 20.5 kW
QR = 0.9025 × (372 − 238.5) = 120.5 kW
COP = 100 / 20.5 = 4.88
V1  = 0.9025 × 0.06496 = 0.0586 m³/s
```

The energy balance checks: `QA + Wc = QR` (100 + 20.5 = 120.5).

## Improving the cycle

**Raising condenser temperature** is always bad news: refrigerating effect falls, required flow rises, volume flow rises, work rises and COP drops. It is the direct penalty of a dirty condenser, a fouled air-cooled coil or a hot day.

**Subcooling the liquid** leaving the condenser: `h4'` drops, so refrigerating effect (`h1 − h4'`) increases, required mass and volume flow decrease, work decreases and **COP increases**. Every degree of subcooling is nearly free capacity.

**Superheating the vapor** entering the compressor:

- If the superheat occurs *in the evaporator* (useful superheat), refrigerating effect increases and COP improves.
- If it occurs *in the suction line* (sensible heat picked up after the evaporator), refrigerating effect stays the same while work increases — **COP falls**. Suction line insulation therefore pays for itself.

**Superheat also protects the compressor**: liquid refrigerant must not reach the compressor cylinders, so the evaporator must boil the charge fully dry.

## The actual cycle

Real systems depart from the ideal through pressure drop ("wiredrawing") in the condenser, evaporator and piping; heat losses and gains along the line; and polytropic rather than isentropic compression. A worked example: R-12 saturated vapor at 260.96 kPa leaves the evaporator at −5 °C but enters the compressor at 0 °C; liquid leaves the condenser at 30 °C and reaches the valve at 25 °C; compression takes 50 kJ/kg with 4 kJ/kg lost in the compressor and 2 kJ/kg in the piping. An energy balance around compressor plus condenser gives `m = 0.416 kg/s` and a refrigerating capacity of **52.3 kW (14.85 TR)**.

Solve the whole cycle interactively — state points, COP, mass flow and a live pressure–enthalpy plot — with the [vapor compression cycle calculator](/vapor-compression) and the standalone [refrigerant p–h chart](/ph-chart), or continue to [refrigerant selection](/guides/refrigerants-odp-gwp-selection) and [compressor performance](/guides/refrigeration-compressor-performance).