---
title: "Absorption and Steam-Jet Refrigeration Systems"
description: "Heat-driven refrigeration without a compressor: aqua-ammonia and lithium-bromide absorption cycles, steam-jet ejector refrigeration, their advantages, limits and worked examples."
category: "Refrigeration Systems"
categorySlug: refrigeration
tags: [absorption refrigeration, steam jet, aqua-ammonia, lithium bromide, heat driven cooling]
date: 2026-10-14
---

Not every refrigeration site has — or wants — a large electric compressor. Absorption and steam-jet systems move heat instead of shaft work, and they earn their place wherever waste heat, solar heat or steam is cheap and electricity is not.

## Absorption refrigeration: a thermal compressor

The absorption cycle is the vapor compression cycle with the compressor replaced by a **thermal compressor**: generator, absorber, pump and heat exchanger. A weak solution absorbs refrigerant vapor at evaporator pressure, the pump lifts the liquid to generator pressure (pumping a liquid is nearly free compared with compressing vapor), heat boils the refrigerant out of the solution, and the strong solution returns through an expansion valve to absorb again.

The key comparison with vapor compression:

| | Absorption | Vapor compression |
|---|---|---|
| Energy source | Heat | Mechanical work |
| Moving parts | Only the pump — smooth, low wear | Compressor — more wear |
| COP behaviour | Works at lower evaporator pressure | COP degrades as pressure ratio rises |
| Suction line | Liquid traces harmless | Liquid can damage the compressor |
| Working pair | Aqua-ammonia or LiBr–water | HFC/CFC refrigerants |

### Aqua-ammonia vs lithium bromide

- **Aqua-ammonia (NH₃–H₂O):** ammonia is the refrigerant, water the absorbent. Works from 0 down to −40 °C, operates at and above atmospheric pressure, and leaks are not a vacuum hazard. Ammonia is toxic, so machine-room rules apply.
- **Lithium bromide (LiBr–H₂O):** water is the refrigerant, so it cannot cool below about 3 °C. Runs below atmospheric pressure (air in-leakage is the enemy and demands tight maintenance), is excellent for higher-temperature cooling, and carries a crystallization risk at low temperatures.

### When absorption wins

- No electricity available (solar, kerosene, LPG-fired units, recreational vehicles)
- Industrial sites with plentiful waste heat that overwhelms the cycle's lower COP
- Where compressor noise is unacceptable
- Where avoiding CFC/HFC refrigerants is the goal

## Steam-jet (ejector) refrigeration

A steam ejector converts the pressure energy of motive steam into velocity — a properly designed nozzle and venturi entrain the low-pressure water vapor from the flash chamber and recompress the mixture back to condenser pressure. The jet vacuum principle means **no moving parts**.

Water is the refrigerant, so chilled water circulates to the load. The balances:

```text
Cooling coils:   QA = m1·(h2 − h1)
Flash chamber:   QA = m3·(h3 − h4)    (m1 = m2, m3 = m4 make-up)
Condenser:       QR = ms·hs + m3·h3 − (ms + m3)·h5
```

### Worked example

> A vacuum refrigeration system removes 3.06 m³/s of vapor from the evaporator; water enters at 15 °C, leaves at 10 °C, make-up enters at 30 °C. Find capacity and chilled-water flow.

From steam tables: `h1 = hf(10 °C) = 41.99`, `h2 = hf(15 °C) = 62.94`, `h3 = hg(10 °C) = 2519.9`, `h4 = hf(30 °C) = 125.66 kJ/kg`, `v3 = vg(10 °C) = 106.4 m³/kg`.

```text
m3 = 3.06 / 106.4 = 0.0288 kg/s
QA = 0.0288 × (2519.9 − 125.66) = 68.9 kW
m1 = QA / (h2 − h1) = 3.29 kg/s
```

### Advantages

1. Flexible operation — capacity changes quickly with load.
2. No moving parts: vibration-free.
3. Can be installed outdoors; low weight per TR.
4. Reliable, low maintenance.
5. Water as refrigerant is completely safe — no leak hazard, ideal for comfort AC and for process chilled water in rubber mills, distilleries, paper and food plants.

### Disadvantages

1. Direct-evaporation duty is limited because the vapor volume handled is enormous.
2. The condenser must reject roughly **twice** the heat per TR of a vapor compression plant.
3. Not practical below about 4 °C chilled water.

## Air cycle, briefly

The reverse Brayton cycle compresses air, rejects heat in a cooler, expands it through a turbine to produce cold, and absorbs heat at low temperature. Its value is practical rather than efficient: no phase-change refrigerant, light and compact — which is why it dominates aircraft air conditioning. It is markedly less efficient than vapor compression on the ground.

Continue with [multi-pressure systems](/guides/multi-pressure-refrigeration-systems) for staged vapor compression, or the [vapor compression cycle](/guides/vapor-compression-refrigeration-cycle) for the baseline every one of these alternatives is measured against.