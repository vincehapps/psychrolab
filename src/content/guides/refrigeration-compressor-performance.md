---
title: "Refrigeration Compressor Performance: Efficiencies and Sizing"
description: "Volumetric, clearance, compression and mechanical efficiency for refrigeration compressors — formulas, worked ammonia and R-12 examples, and how to size bore and stroke for a duty."
category: "Refrigeration Systems"
categorySlug: refrigeration
tags: [compressor, volumetric efficiency, reciprocating compressor, brake work, compression efficiency]
date: 2026-09-30
---

The compressor sets whether a refrigeration plant delivers its rated capacity or falls short. Four efficiencies describe the gap between the ideal cycle on paper and the machine on the floor.

## The four efficiencies

### 1. Actual volumetric efficiency

```text
ηva = V1 / VD
```

`V1` is the volume flow actually drawn in (`mR · v1`), `VD` the piston displacement:

```text
VD = (π/4) · D² · L · Np · nC
```

with `D` bore, `L` stroke, `Np` speed (for a single-acting cylinder `Np = N`; double-acting `Np = 2N`) and `nC` the number of cylinders.

### 2. Clearance volumetric efficiency

```text
ηvc = 1 + c − c·(P2/P1)^(1/k)
```

`c` is percent clearance, `P2/P1` the discharge-to-suction pressure ratio, `k` the isentropic constant (use the polytropic exponent `n` if the process is polytropic). Clearance gas must re-expand before fresh charge can enter, so higher pressure ratio and larger clearance both eat displacement.

### 3. Compression efficiency

```text
ηc = Wc / Wc' = (h2 − h1) / (h2' − h1)
```

Ideal work is isentropic (`s = const`); actual work includes irreversibilities (valve losses, heat transfer, leakage).

### 4. Mechanical efficiency

```text
ηm = WI / WB
```

Indicated work over brake (shaft) work — friction, oil pumping and drive losses.

## Worked example: ammonia cycle analysis

> An NH3 cycle runs at 190.74 kPa suction and 1203.7 kPa discharge, capacity 30 kW, clearance 6%, compression efficiency 70%, mechanical efficiency 75%, actual volumetric efficiency 75%. Find clearance volumetric efficiency, ideal and actual COP, ammonia flow and brake work.

From ammonia tables: `h1 = hg(−20 °C) = 1437.23`, `v1 = 0.6221 m³/kg`, `h2 = 1712 kJ/kg` at discharge pressure with `s2 = s1`, `h3 = h4 = hf(1203.7 kPa) = 346.61 kJ/kg`, `k = 1.304`.

```text
ηvc = 1 + 0.06 − 0.06·(1203.7/190.74)^(1/1.304) = 81.4%
ideal COP   = (h1 − h4) / (h2 − h1) = 1090.6 / 274.8 = 3.97
actual COP  = 1090.6 / (274.8/0.70) = 2.78
mR          = 30 / 1090.6 = 0.0275 kg/s
WB          = (392.5 / 0.75) × 0.0275 = 14.4 kW shaft power
```

The gap between COP 3.97 and 2.78 is entirely compressor quality — the cycle state points never changed.

## Sizing a compressor for a duty

> A 4-cylinder R-12 compressor must carry 25 TR at 1200 RPM between 0 °C and 40 °C; average piston speed 250 m/min, actual volumetric efficiency 78%. Find bore and stroke.

Required mass flow: `mR = (25 × 3.52) / (h1 − h4) = 88 / 112.9 = 0.779 kg/s` (46.75 kg/min). Suction volume flow: `V1 = 46.75 × 0.05539 = 2.59 m³/min`. Displacement: `VD = 2.59 / 0.78 = 3.32 m³/min`.

From piston speed `250 = 2·L·1200` → **stroke L = 10.4 cm**; then `3.32 = (π/4)·D²·0.104·1200·4` → **bore D = 9.2 cm**.

## Sizing by displacement, the other direction

A 4-cylinder 10 × 10 cm R-12 machine at 1200 RPM, with 5 °C subcooling and 10 °C superheat, carrying 100 kW:

```text
mR = 100 / (358 − 233.5) = 0.803 kg/s
V1 = 0.803 × 0.058 = 0.0466 m³/s
VD = (π/4)(0.1)²(0.1)(20)(4) = 0.0628 m³/s
ηva = 0.0466 / 0.0628 = 74.2%
```

With a 90% efficient motor drawing 30 kW, shaft power is 27 kW and mechanical efficiency `ηm = 15.26 / 27 = 56.5%`.

## Reading the results

- **ηva low** — pressure ratio too high, clearance too big, or a leaking valve; the machine physically cannot swallow the rated charge.
- **ηc low** — valve design, superheat or heat transfer problems in the compression process.
- **ηm low** — mechanical friction or a motor operating far from its efficient zone.

None of these change the cycle's thermodynamics; they change how much of it you collect. Build the cycle first with the [vapor compression cycle guide](/guides/vapor-compression-refrigeration-cycle), then split large pressure ratios with [multi-pressure systems](/guides/multi-pressure-refrigeration-systems).