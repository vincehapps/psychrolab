---
title: "Cold Storage and Ice Plant Design: Product Load Calculations"
description: "How to size a cold storage or ice plant: product load, sensible and latent heat, ton of refrigeration, chilling and freezing calculations with worked examples in SI and IP units."
category: "Industrial Plant Systems"
categorySlug: industrial-systems
tags: [cold storage, ice plant, product load, ton of refrigeration, freezing load, refrigeration design]
date: 2026-10-02
---

A cold storage plant is the most effective space for bulk-handling perishable goods between production and marketing — fruits and vegetables for the food industry, but also pharmaceutical, biotechnology and medical stores. An ice plant is the same machine pointed at a single product: ice.

Designing one starts with the **product load** and ends with a compressor sized in tons.

## What the product load is

The product load is all the heat gain occurring *due to the product* inside the refrigerated space. It arises when:

- Product enters at a temperature **higher than storage temperature**
- The process pulls goods from chilling to freezing
- Perishables generate their own heat through **respiration** (fruits and vegetables keep metabolising after harvest)
- Meat and poultry give off heat as they cool

## The constants you need

```text
1 TOR (TR) = 3.5167 kW = 12,000 BTU/h
water: latent heat of fusion (melting/solidification) = 335 kJ/kg = 144 BTU/lb
water: latent heat of vaporization/condensation      = 2257 kJ/kg = 970.3 BTU/lb
cp water = 4.187 kJ/(kg·K)     cp ice ≈ 2.094 kJ/(kg·K) (0.5 BTU/lb·°F)
```

A ton of refrigeration is the heat removed to freeze or melt **one ton of ice at 0 °C in 24 hours** — which is why chiller and cold-room capacities are quoted in TOR even when no ice is made.

## The chilling–freezing path

Freezing water in a space always splits into three loads:

```text
Q1 = sensible: cool the product down to its freezing point
Q2 = latent:   freeze it (335 kJ/kg)
Q3 = sensible: cool the ice down to storage temperature
```

On a temperature plot this is the classic staircase: slope down, flat plateau at 0 °C, slope down again to −15 or −20 °C.

## Worked example (SI): making ice

> Calculate the TOR needed to convert 1 metric ton of water at 50 °C to ice at −20 °C in one day.

```text
Q1 = 1000 × 4.187 × (50 − 0)  = 209,350 kJ   cool to freezing
Q2 = 1000 × 335               = 335,000 kJ   freeze
Q3 = 1000 × 2.094 × (0 − −20) =  41,880 kJ   cool the ice
total = 586,230 kJ/day
```

```text
Power  = 586,230 / 86,400 s = 6.79 kW
TOR    = 6.79 / 3.5167      ≈ 1.93 TOR
```

The latent step is 57% of the whole job — which is exactly why pre-cooling and staging matter in plant operation.

## Worked example (IP): freezing with losses

> Freeze 2 tons (4000 lb) of water from 40 °F to −10 °F in 36 hours, allowing 20% losses on the chilling and freezing loads.

```text
Q1 = 4000 × 1 × (40 − 32)      =  32,000 BTU
Q2 = 4000 × 144                = 576,000 BTU
Q3 = 4000 × 0.5 × 10           =  20,000 BTU
with losses: (32,000 + 576,000) × 1.2 + 20,000 = 749,600 BTU
capacity = 749,600 / 36 h = 20,822 BTU/h ≈ 1.74 TOR
```

Watch the ton here: an English ton is 2000 lb, and 12,000 BTU/h is one TOR — mixing metric and English "tons" is the classic exam trap.

## Worked example: process cooling with brine

> Cool 4000 gal of milk from 80 °F to 40 °F in 5 hours (density 8.6 lb/gal, cp 0.935 BTU/lb·°F), using brine with a 15 °F temperature rise.

Heat rejected by the milk = heat absorbed by the brine:

```text
Q = 4000 × 8.6 × 0.935 × (80 − 40) = 1,287,520 BTU
duty = 1,287,520 / 5 h = 257,504 BTU/h
brine flow = Q / (cp_brine × ΔT) = 257,504 / (0.72 × 15) ≈ 23,800 lb/h
```

## The refrigeration system side

With the load fixed, the plant itself is a vapor compression system — and the course's cold-storage unit covers the full menu of configurations:

- Simple cycle, with **liquid subcooling**
- Cycle with **suction superheating**
- **Subcooling + superheating** together
- **Multi-pressure systems**: 2 evaporators / 1 compressor, 2 compressors / 1 evaporator, 2 compressors / 2 evaporators, intercooling
- Cascade refrigeration
- Absorption, air cycle and steam jet alternatives

Subcooling the condensate increases refrigerating effect and raises COP; superheating the suction guarantees no liquid reaches the compressor. Both are covered quantitatively in the [vapor compression cycle guide](/guides/vapor-compression-refrigeration-cycle), and staging decisions in [multi-pressure systems](/guides/multi-pressure-refrigeration-systems).

Test your numbers against the practice set in [industrial plant solved problems](/guides/industrial-plant-solved-problems), or run state points through the [steam tables tool](/steam-tables) when the plant runs on ammonia at saturation conditions.