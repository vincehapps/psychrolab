---
title: "Cooling Load Solved Problems: Supply Air, SHR and Refrigeration Load"
description: "Three fully worked HVAC cooling load problems: auditorium supply air conditions, restaurant heat gains with infiltration, and a DX system with bypass factor and ventilation load."
category: "Air Conditioning & Ventilation"
categorySlug: air-conditioning
tags: [cooling load problems, SHR, bypass factor, ventilation load, refrigeration load, worked examples]
date: 2026-10-20
---

These three problems walk the full cooling-load procedure: gains → supply air → loads → equipment capacity. The theory is in [cooling load calculations](/guides/cooling-load-calculations); here it is applied.

The two equations you will use in every problem:

```text
Qs = ms·cp·(tr − ts)              sensible
Ql = ms·(ωr − ωs)·hfg             latent (hfg = 2454 kJ/kg)
SHR = Qs / (Qs + Ql)
```

---

## Problem 1 — Auditorium supply conditions and SHR

> An auditorium is held at 25 °C DB / 20 °C WB. Sensible load 110 kW; 50 kg/h of moisture must be removed. Supply air is at 18 °C. Find supply mass flow, supply humidity ratio, supply RH/dew point/WBT, latent load and SHR.

**Given:** `Qs = 110 kW`, `ΔW = 50 kg/h = 0.01389 kg/s`, `tr = 25 °C`, `ts = 18 °C`. From the chart, room air `ωr = 0.0125 kg/kg`.

**Supply mass flow** (sensible equation rearranged):

```text
ms = Qs / (cp·(tr − ts)) = 110 / (1.0062 × 7) = 15.62 kg/s
```

**Supply humidity ratio** (latent equation rearranged):

```text
0.01389 = 15.62 × (0.0125 − ωs)  →  ωs = 0.01161 kg/kg
```

**Supply state** — at the intersection of `ts = 18 °C` and `ωs = 0.01161` on the chart:

```text
RHs = 89%    DPT = 16.2 °C    WBT = 17 °C
```

**Latent load and SHR:**

```text
Ql = 15.62 × (0.0125 − 0.01161) × 2454 = 34.1 kW
SHR = 110 / (110 + 34.1) = 0.76
```

**Reading it:** SHR 0.76 means three quarters of the job is sensible — typical of an occupied auditorium with high internal gains. The supply state at 89% RH shows the coil is working close to saturation; the 18 °C supply limits how much moisture the air can carry away.

---

## Problem 2 — Restaurant: building up the load from scratch

> A restaurant of 1416 m³ seats 100 people at a time (three sittings over two hours). Four 2 kW hot plates, lighting at 3.5 W/m³, fabric gain 6 kW, infiltration at 0.25 air changes/hr, meals adding 10 W sensible + 10 W latent each, occupants 90 W sensible + 30 W latent each. Inside 20 °C / 60% RH, outside 25 °C DB / 20 °C WB, supply 10 °C below room temperature. Find Qs, Ql, supply flow, conditioner capacity, refrigeration load and SHR.

**Sensible gains:**

```text
hot plates 4×2 kW      = 8,000 W
lighting 3.5 W/m³×1416 = 4,956 W
fabric                  = 6,000 W
occupants 100×90 W     = 9,000 W
meals 100×10 W         = 1,000 W
infiltration: mi = 0.25×1416/(3600×0.8614) = 0.1142 kg/s → 0.1142×1.0062×5 = 574 W
total Qs = 29.53 kW
```

**Latent gains:** occupants 3,000 W + meals 1,000 W + infiltration `0.1142×(0.0125 − 0.00874)×2454 = 1,055 W` → **Ql = 5.06 kW**.

**Supply flow and mixing:**

```text
ms = 29.53 / (1.0062 × 10) = 2.94 kg/s
mo (outdoor) = 0.01/0.8614 × 100 persons = 1.16 kg/s ; mr = 1.78 kg/s
mixed enthalpy: hm = (1.16×57 + 1.775×42.3)/2.935 = 48.1 kJ/kg
```

**Capacity and loads:**

```text
supply humidity ratio: Ql = ms·(ωr − ωs)·2454 → ωs = 0.008034, hs = 30.31 kJ/kg
conditioner capacity = mm·(hm − hs) = 2.935 × (48.1 − 30.31) = 52.2 kW
refrigeration load = (Qs + Ql) + mo·(ho − hr) = 34.6 + 17.0 = 51.6 kW
SHR = 29.53 / 34.59 = 0.854
```

**Reading it:** infiltration at only 0.25 ACH still contributes ~1.6 kW of latent load, and the ventilation/mixing decision moves the conditioner capacity more than any single appliance does.

---

## Problem 3 — DX system with bypass factor and ventilation

> An office is conditioned by a direct-expansion system. Outside 35 °C DB / 30 °C WB, inside 25 °C / 50% RH. Room sensible 118 kW, latent 32 kW. Ventilation air 6,796 m³/hr. An R-22 coil with BPF = 0.15. Find SHR, supply air temperature, AC load and refrigeration load.

**States:** outdoor `ωo = 0.025`, `ho = 99.35 kJ/kg`, `vo = 0.9077 m³/kg`; room `ωr = 0.0099`, `hr = 50.37 kJ/kg`.

**SHR:**

```text
SHR = 118 / (118 + 32) = 0.787
```

**Supply temperature from the bypass factor.** BPF is the fraction of air that *misses* the coil surface:

```text
BPF = (ts − tc) / (tr − tc)     with apparatus dew point tc = 12 °C
0.15 = (ts − 12) / (25 − 12)  →  ts = 13.95 °C
```

**Loads:**

```text
AC load = 118 + 32 = 150 kW
ventilation: mo = 6796/3600 / 0.9077 = 2.08 kg/s
vent load = 2.08 × (99.35 − 50.37) = 101.9 kW
refrigeration load = 150 + 101.9 = 251.9 kW
```

**Reading it:** ventilation is **68% of the total refrigeration load**. That single number justifies energy-recovery wheels and minimum-ventilation controls in hot-humid climates. The BPF likewise matters: a 15% bypass pushes the required coil surface (and therefore its rows and face area) well beyond a perfect-coil assumption.

The companion chart procedure — plotting the index point, drawing the SHR reference line, and finding the room apparatus dew point by projecting a parallel line through the room state to the saturation curve — is described in [cooling load calculations](/guides/cooling-load-calculations).

---

## Where to go next

- Property lookups behind every state point: [psychrometry solved problems](/guides/psychrometry-solved-problems)
- Fan and duct side of the same design: [HVAC fan systems and duct design](/guides/hvac-fan-systems-duct-design)
- Run the state points interactively in the [psychrometric chart](/psych-chart)