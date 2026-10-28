---
title: "Reheat and Regenerative Rankine Cycles"
description: "How reheat and regenerative feedwater heating improve the Rankine cycle: open and closed feedwater heaters, extraction fraction, moisture reduction and efficiency gains with worked examples."
category: "Power Plant Engineering"
categorySlug: power-plants
tags: [reheat cycle, regenerative cycle, feedwater heater, open feedwater heater, closed feedwater heater, steam quality]
date: 2026-09-25
---

A simple Rankine cycle leaves efficiency on the table in two ways: heat is added while the feedwater is still cold, and the steam expands so far that it exits the turbine as a wet mixture that erodes the blades. **Reheat** attacks the second problem, **regeneration** the first. Modern plants combine both.

## Why the baseline improves

From the course's own comparison table (400 °C inlet, 50 kPa condenser):

| Configuration | Efficiency |
|---|---|
| Rankine, 3.0 MPa | 28.4% |
| Rankine, 10 MPa | 33.8–34% |
| Reheat, 6 MPa / 20 kPa | 35.8% |
| Reheat, 25 MPa / 20 kPa | 41.6% |
| Regenerative (closed FWH), 10 MPa / 15 kPa | 40.6% |
| Regenerative (open FWH), 5 MPa | 42.5% |

Raising boiler pressure alone buys efficiency but dries nothing; reheat buys both.

## The reheat cycle

Steam expands in a **high-pressure turbine** to an intermediate pressure, returns to the boiler to be reheated at constant pressure back to its original temperature, then finishes in the **low-pressure turbine**.

Why bother: without reheat, water droplets form in the LP stages and impact the blades, cutting efficiency and wearing metal. Reheating **reduces moisture content at the turbine exit** and increases cycle efficiency at the same time.

### Worked example

> Ideal reheat cycle: steam enters the HP turbine at 6 MPa, 400 °C, exits at 2 MPa, is reheated to 400 °C, then expands to 20 kPa in the LP turbine. Find turbine work and thermal efficiency.

State points:

```text
State 2: 6 MPa, 400 °C     h2 = 3177.2 kJ/kg   s2 = 6.5408 kJ/(kg·K)
State 3: s3 = s2 at 2 MPa  h3 = 2900.2 kJ/kg
State 4: 2 MPa, 400 °C     h4 = 3247.6 kJ/kg   s4 = 7.1271 kJ/(kg·K)
State 5: s5 = s4 at 20 kPa → x5 = (7.1271 − 0.832)/(7.9085 − 0.832) = 0.8896
         h5 = 2349.3 kJ/kg
State 6: hf at 20 kPa      h6 = 251.4 kJ/kg
```

Turbine work is both stages:

```text
wt = (h2 − h3) + (h4 − h5) = 277 + 898.3 = 1175.3 kJ/kg
```

Add the pump term and subtract from `qin = (h2 − h1) + (h4 − h3)` for the efficiency. The important structural point: **quality at the LP exit (88.96%) is far better than a single expansion to 20 kPa would give**.

## The regenerative cycle

Bleed (extract) steam from an intermediate turbine stage to preheat the feedwater before it enters the boiler. The logic: heat added at an average temperature closer to the boiler's saves exergy, even though extracting steam slightly reduces turbine work output — the overall effect is that turbine work output drops *slightly* while heat input drops *greatly*, so efficiency rises.

Two heater types:

### Open feedwater heater (OFH)

Extraction steam **mixes directly** with the feedwater at an intermediate pressure. Pressure must match; the arrangement needs **two pumps** (condenser pump to heater pressure, boiler-feed pump after). The mixed stream leaves as saturated (or near-saturated) liquid — which also **deaerates** the water, removing dissolved oxygen and CO₂ that cause corrosion and scale. Two-phase risk: the mixing must come out liquid.

### Closed feedwater heater (CFH)

Extraction steam heats the feedwater through a tube bundle with **no mixing**: the two flows stay separate (`P2 = P7`, `P5 = P6` on the course diagram). The condensed extraction is throttled through a steam trap back to the condenser (`h7 = h8`, entropy rises). Fewer pumps, but less effective deaeration and slightly more complex drain routing.

### Finding the extraction fraction

Apply an energy balance around the heater. For the open heater with extraction fraction `y`:

```text
y·h_extraction + (1 − y)·h_condensate = 1·h_feedwater_exit
```

Solve for `y`, then the whole cycle runs on two streams: `y` through the bleed point onward to the heater, `1 − y` straight to the condenser.

### Worked example

> Ideal regenerative cycle, 15 MPa and 600 °C, condenser 10 kPa, steam extracted at 1.2 MPa into an open feedwater heater. Find extraction fraction, Q_in, turbine work and efficiency.

With extraction near 1.2 MPa: `y ≈ 0.25`, `qin ≈ 2683 kJ/kg`, pump work ≈ 17 kJ/kg, turbine work ≈ 1258 kJ/kg, **η ≈ 46.3%** — against roughly 34% for the simple cycle at 10 MPa. Sweeping the extraction pressure in the course data (1500–2700 kPa) barely moves the result: efficiency stays within about 1% across the band, which is why heater pressure is chosen for mechanical and thermal-layout reasons rather than being tuned tightly.

## Combined reheat–regenerative

The final configuration does both: reheat between HP and LP turbines, one or more feedwater heaters fed by extractions from both turbine bodies. This is the standard utility cycle, reaching 40–45% thermal efficiency.

Model the state points with the [saturated steam tables and T–s diagram](/steam-tables), or step back to the [Rankine cycle fundamentals](/guides/rankine-cycle-steam-power-plant) if the baseline is not solid yet.