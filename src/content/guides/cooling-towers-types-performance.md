---
title: "Cooling Towers: Types, Range, Approach and Performance"
description: "How cooling towers work: atmospheric vs mechanical draft, cooling range, approach, effectiveness, evaporation losses and the mass and energy balance with a worked example."
category: "Air Conditioning & Ventilation"
categorySlug: air-conditioning
tags: [cooling towers, wet-bulb temperature, approach, cooling range, evaporative cooling, heat rejection]
date: 2026-09-28
---

A cooling tower cools water by contacting it with air and evaporating a small fraction of the water. It is the heat-rejection end of every chiller, condenser loop and industrial process — and its performance is bounded by the **wet-bulb temperature** of the ambient air, not the dry bulb.

## Two families of tower

### Atmospheric (natural-draft) tower

Air circulation comes from wind velocity alone.

**Advantages:** no mechanical parts to fail, long trouble-free life, no recirculation of humid exhaust into the intake, essentially no maintenance energy.

**Disadvantages:** needs great length for large installations, must stand in exposed locations, cold-water temperature fluctuates with wind, and requires greater pumping head.

### Mechanical-draft tower

A fan or blower drives the air, in one of two arrangements:

- **Induced draft** — fan at the exit, pulling air through the fill.
- **Forced draft** — fan at the inlet, pushing air through.

**Advantages:** close control of cold-water temperature, small footprint, lower water pumping head.

**Disadvantages:** fan power consumption, mechanical failure modes, recirculation of hot humid exhaust into the air intake (which raises the entering wet bulb and degrades performance), and higher maintenance cost.

Selection weighs type, size, design, performance and cost.

## The three numbers that define performance

```text
Cooling Range = tA − tB                 hot water in − cool water out
Approach      = tB − WBT1               cool water out − entering wet bulb
Effectiveness E = Range / (Range + Approach) = (tA − tB) / (tA − WBT1)
```

`tA` is warm water entering, `tB` is cool water leaving, `WBT1` is the entering air wet-bulb temperature.

**Approach is the honest metric.** You cannot cool water below the entering wet bulb no matter how big the tower is; a smaller approach means a bigger, more expensive tower. Range is set by the process, approach by the tower.

## What drives effectiveness

1. Mean vapor-pressure difference between air and water in the tower.
2. Amount of exposed water surface and time of exposure (fill design).
3. Air velocity through the tower.
4. Airflow direction relative to the exposed water surfaces.

## Mass and energy balance

With `mA`, `mB` the water flows in and out and `ma` the dry-air flow:

```text
mA − mB = ma · (ω2 − ω1)        water lost to evaporation
mA·hA − mB·hB = ma · (h2 − h1)  energy balance
```

`hA` and `hB` are liquid-water enthalpies (`hf` at the respective temperatures); `h1`, `h2` and `ω1`, `ω2` are the air enthalpies and humidity ratios entering and leaving.

## Worked example

> Water enters at 50 °C and leaves at 25 °C. Air enters at 30 °C and 45% RH, leaves saturated at 45 °C. Find the air volume needed per kg of water, and the water that 142 m³/min of air can cool.

Air states from the chart: `ω1 = 0.012`, `h1 = 60.75 kJ/kg`, `v1 = 0.875 m³/kg` entering; `ω2 = 0.065`, `h2 = 213.31 kJ/kg` leaving. Water: `hA = hf(50 °C) = 209.33`, `hB = hf(25 °C) = 104.89 kJ/kg`.

Set `mA = 1 kg`. Mass balance gives `mB = 1 − 0.053·ma`. Substituting into the energy balance:

```text
209.33 − (1 − 0.053·ma)·104.89 = ma·(213.31 − 60.75)
ma = 0.7085 kg air / kg water
Va = 0.7085 × 0.875 = 0.62 m³ air / kg water
```

For 142 m³/min of air: `mw = 142 / 0.62 ≈ 229 kg/min` of water cooled.

## Water losses to budget for

- **Evaporation** — the working mechanism; roughly 1% of circulating flow per 5.5 °C of range.
- **Drift** — droplets carried out with the air; controlled by drift eliminators.
- **Blowdown** — deliberately bled water to control dissolved solids that concentrate as evaporation removes pure water.

Blowdown and make-up water are the operational cost side of the tower; the tower's effectiveness does not capture them.

Check your own approach and range against the wet-bulb using the [psychrometric calculator](/psych-chart), and see [industrial fans and blowers](/guides/hvac-fan-systems-duct-design) for the air-side equipment. Next up: [cooling load calculations](/guides/cooling-load-calculations) to size what the tower must reject.