---
title: "Compressed Air Systems: Staging, Intercooling and Compressor Work"
description: "How reciprocating air compressors work: piston displacement, volumetric efficiency, single vs multi-stage compression with intercooling, and the work saved by staging with a worked example."
category: "Industrial Plant Systems"
categorySlug: industrial-systems
tags: [compressed air, air compressor, intercooling, staging, polytropic compression, volumetric efficiency]
date: 2026-10-16
---

A compressor is a machine that increases the pressure of a gas by decreasing its volume. In a plant it runs everything from control air to pneumatic tools — and because compression costs power proportional to pressure ratio, staging decisions are pure money.

## Compressor types

Reciprocating, rotary, centrifugal, axial flow, hydraulic, jet and vapor jet. The reciprocating machine is the workhorse of small and mid-size plant air, and its behaviour is described by a few quantities.

## The performance chain

```text
Piston displacement:  VD = (π/4)·D²·L·Np·nC
Actual volumetric efficiency: ηva = V' / VD
Clearance volumetric efficiency: ηvc = 1 + c − c·(P2/P1)^(1/n)
Capacity: V1 = ηva · VD
```

`D` bore, `L` stroke, `Np` speed (double the RPM for double-acting cylinders), `nC` cylinders, `c` percent clearance. The actual volumetric efficiency sits below the clearance value because of valve pressure drop, heat transfer during the stroke and residual gas left at delivery.

### Compression processes compared

- **Isothermal** (`T = const`) — minimum possible work, but heat must be removed continuously.
- **Isentropic** (`s = const`) — ideal, reversible, adiabatic; no heat lost or gained.
- **Polytropic** (`PV^n = C`) — the real path: neither purely adiabatic nor isothermal.

The course's reference case `PV^1.3 = C` sits between the isothermal (`n = 1`) and the isentropic (`n = 1.4` for air).

## Staging and intercooling

Two- and three-stage compressors exist for one reason: an intercooler between stages. It:

- Rejects the heat of first-stage compression
- **Cools the gas so its density rises** — more air is compressed per stroke for the same work
- Reduces energy consumption
- Prevents damage from high discharge temperatures

For **minimum total work**: the pressure ratio must be equal per stage (`Pd/Ps` constant), intercooling must be complete (gas returns to its initial temperature), compression within each stage should be isentropic, and work per stage comes out equal.

## Worked example: how much does staging save?

> Compress 8.5 m³/min from 98.56 kPa to 985.6 kPa with `n = 1.3`. Find the saving from two-stage compression with perfect intercooling.

**Single stage:**

```text
W1 = [n/(n−1)]·P1·V1·[(P2/P1)^((n−1)/n) − 1]
   = (1.3/0.3)·98.56·8.5·[10^(0.3/1.3) − 1]
   = 2540 kJ/min
```

**Two stages** with the optimal intermediate pressure:

```text
Px = √(P1·P2) = √(98.56 × 985.6) = 311.7 kPa     ratio per stage = √10 = 3.162
Stage 1: V1 = 8.5 m³/min     → 1094 kJ/min
Stage 2: Vx = V1·(P1/Px) = 8.5 × (98.56/311.7) = 2.68 m³/min  → 1092 kJ/min
total = 2186 kJ/min
```

```text
saving = (2540 − 2186) / 2540 ≈ 14%
```

Equal work in both stages — the signature of correct staging. (Check: each stage compresses roughly 1093 kJ/min, and `Px` as the geometric mean of the pressures is what makes the ratios equal.)

## Other plant-air numbers

- **Free air** ratings are quoted at atmospheric inlet conditions; temperature at the intake directly changes mass flow and power.
- **Clearance** shows up as delivery loss: a machine with 10% clearance compressing from 0.98 to 7 bar with `n = 1.3` delivers measurably less per stroke than its displacement suggests — compute with the clearance efficiency formula, never assume displacement equals capacity.
- **Receiver sizing** buffers the gap between compressor capacity and fluctuating demand; a correctly sized receiver avoids an oversized compressor running unloaded.

## Where this connects

Air-cycle refrigeration reuses exactly this machinery — compress, reject heat, expand through a turbine — which is covered under [absorption and steam-jet refrigeration](/guides/absorption-steam-jet-refrigeration) alongside the other non-vapour-compression options. Compressor *performance metrics* for refrigeration duty are worked through in [refrigeration compressor performance](/guides/refrigeration-compressor-performance), and the numbers here are practiced in [industrial plant solved problems](/guides/industrial-plant-solved-problems).