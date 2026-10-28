---
title: "Psychrometry Solved Problems: 5 Worked Examples with Solutions"
description: "Five fully worked psychrometry problems: specific volume and enthalpy at altitude, DBT/WBT property calculations, cooling tower energy balance, refrigerating capacity and water removal."
category: "Air Conditioning & Ventilation"
categorySlug: air-conditioning
tags: [psychrometry problems, worked examples, practice problems, solved problems, humidity ratio]
date: 2026-10-19
---

Nothing tests psychrometry like working problems end to end. This set follows the standard method: sketch the states, fix two independent properties, and let the balances do the rest. Every formula used is explained in [psychrometrics fundamentals](/guides/psychrometrics-fundamentals).

## The method

1. Write down what is given, and what is asked.
2. Get the saturation pressure `Pd` at each known temperature from the steam tables.
3. Get vapor pressure: `Pv = RH · Pd` (if RH is given) or `Pv = Pw − Pt · 6.66×10⁻⁴ · (DBT − WBT)` (if wet bulb is given).
4. Compute `ω = 0.622·Pv/(Pt − Pv)`, `v = R·T/(Pt − Pv)`, `h = cp·t + ω·hg`.
5. Check units and magnitudes: `ω` is usually 0.005–0.030 kg/kg; `v` around 0.8–0.95 m³/kg.

---

## Problem 1 — Properties at altitude

> Calculate the specific volume and enthalpy of an air–water vapor mixture at 30 °C, `ω = 0.015 kg/kg`, atmospheric pressure 85 kPa.

**Solution.** Recover the vapor pressure from the humidity ratio by rearranging `ω = 0.622·Pv/(Pt − Pv)`:

```text
Pv = ω·Pt / (0.622 + ω) = 0.015 × 85 / 0.637 = 2.00 kPa
```

```text
v = R·T/(Pt − Pv) = 0.2871 × 303 / (85 − 2.00) = 1.048 m³/kg
h = cp·t + ω·hg = 1.0062 × 30 + 0.015 × 2556.5 = 68.5 kJ/kg
```

**Take-away:** at 85 kPa the same humidity ratio coexists with a *larger* specific volume than at sea level — altitude inflates volume flow for the same mass flow, which is why fan and duct sizing must use site elevation.

---

## Problem 2 — From dry- and wet-bulb to the full state

> DBT = 30 °C, WBT = 25 °C, barometric pressure 101 kPa. Find humidity ratio, enthalpy, relative humidity, specific volume and dew point.

**Solution.** Saturation pressure at the wet bulb: `Pw = Psat(25 °C) = 3.169 kPa`. Vapor pressure from the psychrometer equation:

```text
Pv = 3.169 − 101 × 6.66×10⁻⁴ × (30 − 25) = 2.833 kPa
```

```text
ω   = 0.622 × 2.833 / (101 − 2.833) = 0.0180 kg/kg
h   = 1.0062 × 30 + 0.0180 × 2556.5 = 76.2 kJ/kg
RH  = Pv / Psat(30 °C) = 2.833 / 4.246 = 66.7%
v   = 0.2871 × 303 / (101 − 2.833) = 0.886 m³/kg
DPT = Tsat at 2.833 kPa ≈ 23.0 °C   (interpolating 20 °C: 2.339 kPa, 25 °C: 3.169 kPa)
```

**Check:** dew point (23.0 °C) sits below DBT (30 °C) and below WBT (25 °C) — always true for unsaturated air.

---

## Problem 3 — Cooling tower spray cooling and make-up

> 15 m³/s of air at 35 °C DB / 24 °C WB, 101 kPa, enters a tower and leaves saturated at 30 °C. (a) To what temperature can this air cool a water spray entering at 40 °C with 20 kg/s? (b) What make-up water is needed for evaporation?

**Solution.** Air in: `Pv = 2.985 − 101 × 6.66×10⁻⁴ × 11 = 2.245 kPa`, so

```text
ω1 = 0.01414 kg/kg   h1 = 71.5 kJ/kg   v1 = 0.895 m³/kg
ma = 15 / 0.895 = 16.75 kg/s
```

Air out (saturated at 30 °C): `ω2 = 0.02730`, `h2 = 100.0 kJ/kg`.

Mass balance — evaporation:

```text
Δm = ma·(ω2 − ω1) = 16.75 × 0.01316 = 0.22 kg/s     (b) make-up
```

Energy balance with `hf(40 °C) = 167.57 kJ/kg`:

```text
ma·h1 + mw·hf(40) = ma·h2 + mw_out·hf(t)
16.75×71.5 + 20×167.57 = 16.75×100.0 + 19.78·hf(t)
hf(t) = 145.3 kJ/kg  →  t ≈ 34.7 °C                (a)
```

**Reading it:** 20 kg/s of water dropped only ~5 °C because the airflow was thin relative to the water flow — the tower is air-limited in this configuration.

---

## Problem 4 — Refrigerating capacity and dehumidification rate

> 3.5 m³/s of air at 25 °C DB, 50% RH enters an AC unit; it leaves at 15 °C DB, 90% RH. Find refrigerating capacity (kW) and the rate of water removal.

**Solution.**

```text
State 1: Pv = 0.5×3.169 = 1.585 kPa → ω1 = 0.00988, v1 = 0.8578 m³/kg, h1 = 50.33 kJ/kg
State 2: Pv = 0.9×1.705 = 1.535 kPa → ω2 = 0.00957, h2 = 39.28 kJ/kg
ma = 3.5 / 0.8578 = 4.08 kg/s
RC = ma·(h1 − h2) = 4.08 × 11.05 = 45.1 kW
ΔM = ma·(ω1 − ω2) = 4.08 × 0.00031 = 0.0013 kg/s
```

**Reading it:** the dew point of state 1 is about 14 °C, and the coil leaves at 15 °C — barely below it. Almost all the capacity is sensible; moisture removal is negligible. Compare with the course's 30 °C version of the same problem (RC ≈ 99.5 kW, ΔM ≈ 0.015 kg/s): inlet conditions dominate everything.

---

## Problem 5 — Cooling tower water flow and exit temperature

> 50 GPM of water enters a cooling tower at 45 °C. Air at 15 °C, 55% RH enters at 2.85 m³/s and leaves saturated at 30 °C (standard pressure). Find (a) the water leaving the tower and (b) its exit temperature.

**Solution.** Air in: `Pv = 0.55 × 1.705 = 0.938 kPa` → `ω1 = 0.00581`, `h1 = 29.8 kJ/kg`, `v1 = 0.824 m³/kg`, so `ma = 2.85/0.824 = 3.46 kg/s`. Air out: `ω2 = 0.02721`, `h2 = 99.7 kJ/kg`.

```text
evaporation = 3.46 × (0.02721 − 0.00581) = 0.074 kg/s
50 GPM = 3.154 kg/s in → mw_out = 3.154 − 0.074 ≈ 3.08 kg/s (≈ 4.9 GPM)   (a)
```

Energy balance with `hf(45 °C) = 188.45 kJ/kg`:

```text
3.46×29.8 + 3.154×188.45 = 3.46×99.7 + 3.08·hf(t)
hf(t) = 114.4 kJ/kg  →  t ≈ 27.3 °C                (b)
```

**Reading it:** the exit water (27.3 °C) is below the outlet air temperature (30 °C) — valid in the overall balance because the *entering* air was cold. Approach to the 15 °C inlet wet bulb is 12.3 °C: a deliberately modest (cheap) tower.

---

## Practice

Try the remaining variants yourself: the same sheet's exercise mixing 28 m³/min at 40 °C/15% RH with 14 m³/min at 20 °C/90% RH, solved step-by-step in [air conditioning processes](/guides/air-conditioning-processes-psychrometric-chart). Then move on to [cooling load solved problems](/guides/cooling-load-solved-problems), where these properties feed full-system sizing.