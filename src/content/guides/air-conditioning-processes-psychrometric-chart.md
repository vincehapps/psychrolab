---
title: "Air Conditioning Processes on the Psychrometric Chart"
description: "A practical guide to the classic air conditioning processes — sensible cooling, dehumidification, evaporative cooling, heating, humidifying and mixing — with equations and a worked problem."
category: "Air Conditioning & Ventilation"
categorySlug: air-conditioning
tags: [psychrometric chart, air conditioning processes, adiabatic saturation, mixing, dehumidification]
date: 2026-09-14
---

Every component in an air conditioning system moves the air state from one point to another on the [psychrometric chart](/psych-chart). Learning to recognise those movements — and to quantify them — turns chart reading into design work.

This guide covers the classic air conditioning processes, the mass and energy balances behind them, and a full worked dehumidifier problem.

## The nine classic processes

On a chart of humidity ratio (`ω`, vertical) against dry-bulb temperature (horizontal), the standard processes are:

1. **Sensible cooling** — temperature drops, `ω` constant. A dry cooling coil.
2. **Sensible heating** — temperature rises, `ω` constant. A heating element or hot-water coil.
3. **Cooling and dehumidifying** — both temperature and `ω` fall. A chilled-water coil below the dew point; the air crosses the saturation line and condensate leaves the coil.
4. **Cooling and humidifying (adiabatic saturation / evaporative cooling)** — temperature falls while `ω` rises along a constant-enthalpy line. An evaporative cooler or air washer with recirculated water.
5. **Humidifying** — `ω` rises at constant temperature. Steam injection.
6. **Heating and humidifying** — temperature and `ω` both rise. Winter conditioning with heat plus humidifier.
7. **Chemical dehumidification** — `ω` falls while temperature rises. A desiccant wheel: latent heat of adsorption becomes sensible heat.
8. **Dehumidifying** — `ω` falls with modest temperature change.
9. **Mixing** — two airstreams combine; the mixture state lies on the straight line connecting them, dividing the line in inverse ratio of the mass flows.

## The governing balances

### Mixing

For two streams with mass flows `m1` and `m2` mixing into stream `m`:

```text
m1·DBT1 + m2·DBT2 = m·DBTm
m1·ω1   + m2·ω2   = m·ωm
m1·h1   + m2·h2   = m·hm
```

This is why a mixing box state is read off the connecting line — it is three simultaneous linear balances.

### Cooling and dehumidifying

Removing moisture and heat from a stream:

```text
ΔM = ma · (ω1 − ω2)          condensate removed [kg/s]
Q  = ma · (h1 − h2)          cooling load [kW]
```

where `ma` is the dry-air mass flow. The two equations come straight from mass balance on water and energy balance on the mixture.

### Heating and humidifying

The same balances run the other way: heat supplied is `ma · (h2 − h1)` and moisture added is `ma · (ω2 − ω1)`.

## Worked example: a dehumidifier coil

> Moist air at 30 °C and 60% RH enters the refrigeration coil of a dehumidifier at 1.5 kg/s. It leaves saturated at 15 °C. Find the condensate removed and the refrigeration capacity.

From the chart (or a calculator):

- Inlet: `h1 = 71.2 kJ/kg`, `ω1 = 0.01614 kg/kg`
- Outlet (saturated at 15 °C): `h2 = 42.0 kJ/kg`, `ω2 = 0.01065 kg/kg`

Condensate:

```text
ΔM = 1.5 × (0.01614 − 0.01065) = 0.00824 kg/s
```

Cooling load:

```text
Q = 1.5 × (71.2 − 42.0) = 43.8 kW ≈ 12.4 TR
```

Notice both answers came from just the two end states — the path inside the coil does not matter for the balances. (1 TR = 3.517 kW.)

## Worked example: mixing outdoor and return air

> Outdoor air at 35 °C DB / 25 °C WB flows at 2 kg/s. Return air at 24 °C and 50% RH flows at 3 kg/s. Find the mixture state.

```text
DBTm = (2 × 35 + 3 × 24) / 5 = 28.4 °C
ωm   = (2 × 0.016 + 3 × 0.009) / 5 = 0.0119 kg/kg
hm   = (2 × 75.50 + 3 × 47.82) / 5 = 58.9 kJ/kg
```

Mixing always lands between the two states — never outside them. If a mixture calculation gives a result beyond the two inputs, one of the input states is wrong.

## Reading the chart efficiently

- **Horizontal movement** is sensible: heat exchange with no moisture change.
- **Vertical movement** is latent: moisture change with no temperature change.
- **Slanted constant-enthalpy lines** (up-left to down-right) govern evaporative cooling and adiabatic saturation.
- **The saturation curve** is the boundary: any process path crossing it condenses water.

Try plotting the dehumidifier problem yourself in the [interactive psychrometric chart](/psych-chart), or compare the same processes on the European [Mollier h–x diagram](/mollier).

Next: sizing the equipment itself in [cooling load calculations](/guides/cooling-load-calculations).