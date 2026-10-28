---
title: "Psychrometrics Fundamentals: Properties of Moist Air Explained"
description: "Learn the core psychrometric properties — dry-bulb, wet-bulb and dew-point temperature, relative humidity, humidity ratio, specific volume and enthalpy — with formulas and a worked example."
category: "Air Conditioning & Ventilation"
categorySlug: air-conditioning
tags: [psychrometrics, dry-bulb temperature, wet-bulb temperature, dew point, relative humidity, humidity ratio]
date: 2026-09-07
---

**Psychrometrics** is the study of the physical and thermodynamic properties of mixtures of dry air and water vapor. Every air conditioning decision — coil sizing, duct sizing, dehumidification load, cooling tower approach — ultimately reduces to knowing the state of moist air, and that is what psychrometrics gives you.

If you can determine two independent properties of an air sample, the rest of its state follows from a small set of equations. This guide walks through those properties, the key formulas, and a full worked example.

## The properties of moist air

### Dry-bulb temperature (DBT)

Dry-bulb temperature is simply the temperature of the air measured by an ordinary thermometer. It is the property people mean when they say "it is 30 degrees".

### Wet-bulb temperature (WBT)

Wet-bulb temperature is measured with a thermometer whose bulb is wrapped in a wick wetted with water and exposed to the moving air. Evaporation of the wick cools the bulb, so the wet-bulb reading is always at or below the dry-bulb reading. The drier the air, the larger the gap between DBT and WBT.

A sling psychrometer — two thermometers, one wetted, swung through the air — is the classic field instrument for measuring both at once.

### Dew-point temperature (DPT)

Dew point is the temperature to which air must be cooled, at constant pressure, before moisture begins to condense out of it. When the dew point reaches the surface temperature, condensation forms — the reason cold-water pipes sweat and windows fog. Dew point is the saturation temperature corresponding to the actual vapor pressure in the air.

### Relative humidity (RH)

Relative humidity is the ratio of the actual partial pressure of water vapor to the saturation pressure of water at the same temperature:

```text
RH = Pv / Pd
```

where `Pv` is the partial vapor pressure and `Pd` is the saturation pressure at the dry-bulb temperature. At 100% RH the air is saturated: DBT, WBT and DPT all coincide.

### Humidity ratio (specific humidity)

Humidity ratio, written `ω` (omega), is the mass of water vapor per unit mass of dry air. Deriving it from the ideal gas law for each component gives one of the most-used equations in the field:

```text
ω = 0.622 · Pv / (Pt − Pv)    [kg vapor / kg dry air]
```

where `Pt` is total atmospheric pressure. Because `Pt` appears in the denominator, altitude matters: at high elevation the same vapor pressure produces a higher humidity ratio.

### Specific volume

Specific volume is the volume of the mixture per kilogram of dry air:

```text
v = R · T / (Pt − Pv)    [m³/kg dry air]
```

with `R = 0.2871 kJ/(kg·K)` for dry air and `T` in kelvin. It converts between volumetric flow (what a fan delivers) and mass flow (what the equations need).

### Enthalpy and the sensible/latent split

Enthalpy of the air–vapor mixture per kilogram of dry air is:

```text
h = cp · t + ω · hg    [kJ/kg dry air]
```

where `cp = 1.0062 kJ/(kg·K)` is the specific heat of dry air and `hg` is the enthalpy of saturated vapor at the dry-bulb temperature.

Two kinds of heat matter in air conditioning:

- **Sensible heat** changes temperature without changing phase — what a cooling coil removes when it only cools air.
- **Latent heat** changes phase without changing temperature — what condenses out of air as moisture when the coil cools air below its dew point.

## Worked example

> Air is at 30 °C DBT and 50% RH at 101.3 kPa. Find the humidity ratio, dew point, specific volume and enthalpy.

1. Saturation pressure at 30 °C: `Pd = 4.246 kPa`.
2. Vapor pressure: `Pv = RH · Pd = 0.5 × 4.246 = 2.123 kPa`.
3. Humidity ratio: `ω = 0.622 × 2.123 / (101.3 − 2.123) = 0.0133 kg/kg`.
4. Dew point: saturation temperature at 2.123 kPa gives `DPT ≈ 18.3 °C`.
5. Specific volume: `v = 0.2871 × 303 / (101.3 − 2.123) = 0.877 m³/kg`.
6. Enthalpy: with `hg = 2556.5 kJ/kg` at 30 °C, `h = 1.0062 × 30 + 0.0133 × 2556.5 ≈ 64.2 kJ/kg`.

That is the complete state of the air from two given properties — exactly the logic behind PsychroLab's [psychrometric chart calculator](/psych-chart), which solves any two-property pair for the full state.

## Where these properties appear in design

- **Cooling load calculations** use `ω` and `h` to split sensible and latent loads.
- **Coil selection** uses dew point to predict condensate rate: condensate equals mass flow times the change in humidity ratio.
- **Cooling towers** use wet-bulb temperature to define the approach.
- **Duct design** uses specific volume to convert volumetric flow to mass flow.

Continue with [air conditioning processes on the psychrometric chart](/guides/air-conditioning-processes-psychrometric-chart) to see how air changes state as it passes through coils, humidifiers and mixing boxes.