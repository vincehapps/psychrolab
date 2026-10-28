---
title: "Cooling Load Calculations: Sensible, Latent and Refrigeration Loads"
description: "How to calculate air conditioning cooling loads step by step: sensible and latent heat gains, supply air mass flow, SHR, ventilation load and refrigeration capacity with worked examples."
category: "Air Conditioning & Ventilation"
categorySlug: air-conditioning
tags: [cooling load, sensible heat ratio, SHR, refrigeration load, ventilation load, supply air]
date: 2026-09-21
---

A cooling load calculation answers one question: how much heat and moisture must the system remove to hold the room at its design condition — and how much supply air is needed to do it. This guide follows the standard procedure from load sources through to refrigeration capacity.

## Heat gains that make up the load

**Sensible heat gains** (raise temperature):

- Heat transmission through walls, floors, windows, ceilings, doors and partitions
- Solar gain through glass, absorbed by inside surfaces and furnishings
- Heat brought in by infiltration or ventilation air
- Occupants, lights, motors, appliances and equipment
- Products or materials entering hotter than the space

**Latent heat gains** (add moisture):

- Moisture from occupants
- Moisture from internal sources: wet surfaces, combustion, humid processes
- Infiltration and ventilation air with a higher humidity ratio than the room

Supply duct heat gain, duct leakage and fan motor heat are the miscellaneous additions.

## The design procedure

1. Select inside design conditions (temperature and RH).
2. Determine outside design conditions for the location and season.
3. Determine the ventilation requirement for the space.
4. Estimate maximum sensible and latent heat gains.
5. Study the layout, decide zoning.
6. Select equipment and design the ductwork.

## Supply air: the two fundamental equations

For supply air mass flow `ms`, room temperature `tr`, supply temperature `ts`:

```text
Qs = ms · cp · (tr − ts)              sensible heat [kW]
Ql = ms · (ωr − ωs) · hfg             latent heat [kW]
```

with `cp = 1.0062 kJ/(kg·K)` and `hfg ≈ 2454 kJ/kg`. Rearranged, the sensible equation gives the supply mass flow directly:

```text
ms = Qs / (cp · (tr − ts))
```

The **sensible heat ratio** condenses the room's character into one number:

```text
SHR = Qs / (Qs + Ql)
```

SHR is drawn as a reference line on the chart: the supply condition must sit on a line through the room state with slope corresponding to the SHR.

## Load stacking

Three loads are kept separate on purpose:

```text
Air conditioning load = Qs + Ql
Ventilation load      = mo · (ho − hr)
Refrigeration load    = AC load + ventilation load
```

The ventilation load is the penalty for bringing outside air in — often larger than the room load itself when 100% fresh air is used. Mixing outdoor and return air before the coil, or reducing outdoor air to the code minimum, attacks exactly this term.

## Worked example: auditorium with 100% outside air

> A room has Qs = 20 kW, Ql = 10 kW. Outside air is 30 °C / 50% RH; the room is held at 20 °C DB / 15 °C WB. Supply air is 17 °C, all outdoor air with reheat. Find refrigeration load, fan capacity and reheat duty.

From the chart: outdoor air `ho = 64.2 kJ/kg`, `ωo = 0.0133`; room air `hr = 41.7 kJ/kg`, `ωr = 0.00851`.

Supply mass flow from the sensible equation:

```text
ms = 20 / (1.0062 × (20 − 17)) = 6.63 kg/s
```

Supply humidity ratio from the latent equation:

```text
10 = 6.63 × (0.00851 − ωs) × 2454   →   ωs = 0.00790 kg/kg
```

Loads:

```text
AC load       = 20 + 10 = 30 kW
Ventilation   = 6.63 × (64.21 − 41.72) = 149.1 kW
Refrigeration = 179.1 kW
```

Fan volume flow: with `vs = 0.832 m³/kg`, `Vs = 6.63 × 0.832 = 5.52 m³/s`. Reheat duty: `ms · (hs − h1) = 6.63 × (37.11 − 30.4) = 44.5 kW`.

The ventilation term dominates here — a signature of 100% outdoor air systems.

## Worked example: room loads from equipment and occupants

> A restaurant of 1416 m³ seats 300 people over three sittings (100 at a time). Four 2 kW hot plates, lighting at 3.5 W/m³, fabric gain 6 kW, infiltration at 0.25 air changes/hr. Occupants give 90 W sensible + 30 W latent each; meals 10 W + 10 W each. Inside 20 °C / 60% RH, outside 25 °C DB / 20 °C WB, supply 10 °C cooler than room.

Sensible: hot plates 8000 W + lighting 4956 W + fabric 6000 W + occupants 9000 W + meals 1000 W + infiltration 574 W ≈ **29.5 kW**.

Latent: occupants 3000 W + meals 1000 W + infiltration 1055 W ≈ **5.1 kW**.

Then `ms = 29.5 / (1.0062 × 10) = 2.94 kg/s`, mixed-air enthalpy from the outdoor/return split, conditioner capacity `mm·(hm − hs) = 52.2 kW`, and `SHR = 29.5 / 34.6 = 0.85`.

## Putting it together

The output of these calculations feeds equipment selection: coil rows and face area from the apparatus dew point and bypass factor, fan size from volume flow, refrigeration tonnage from the refrigeration load. Solve any state point in the chain with the [psychrometric calculator](/psych-chart), run the numbers with the [cooling load calculator](/cooling-load), then continue to [cooling towers](/guides/cooling-towers-types-performance) for the heat-rejection side.