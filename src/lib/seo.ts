/**
 * Central SEO registry: one distinct title/description/canonical per route,
 * plus JSON-LD (WebApplication + BreadcrumbList, optionally FAQPage).
 * Keeping it in one module avoids duplicated <title> tags and makes the
 * per-route copy auditable in a single place.
 */

export const SITE_URL = 'https://www.psychrolab.org';

export interface FaqItem {
  q: string;
  a: string;
}

export interface SeoEntry {
  path: string;
  title: string;
  description: string;
  /** Extra FAQs emitted as FAQPage structured data */
  faq?: FaqItem[];
}

export const SEO: Record<string, SeoEntry> = {
  home: {
    path: '/',
    title: 'Interactive Psychrometric Chart & Mollier Diagram | PsychroLab',
    description:
      'Free interactive psychrometric chart, Mollier h-x diagram, refrigerant p-h chart, vapor compression cycle, steam tables and HVAC calculators. No signup, SI and IP units.',
    faq: [
      {
        q: 'What is a psychrometric chart?',
        a: 'A psychrometric chart plots dry-bulb temperature against humidity ratio for moist air, with relative humidity, wet-bulb, dew-point and enthalpy lines overlaid. Any two independent properties fix the complete state of the air.'
      },
      {
        q: 'Is PsychroLab free to use?',
        a: 'Yes. Every calculator — psychrometric chart, Mollier diagram, refrigerant p-h chart, vapor compression cycle, steam tables, air mixing, cooling load and duct sizing — runs in the browser without an account.'
      }
    ]
  },
  'psych-chart': {
    path: '/psych-chart',
    title: 'Interactive Psychrometric Chart Calculator (SI & IP) | PsychroLab',
    description:
      'Plot unlimited moist-air state points on a live psychrometric chart. Solve any two properties, read wet bulb, dew point, enthalpy and humidity ratio, overlay ASHRAE 55 comfort zones and export PNG, SVG or CSV.'
  },
  mollier: {
    path: '/mollier',
    title: 'Mollier h-x Diagram (DIN 4107) — Interactive Psychrometrics | PsychroLab',
    description:
      'Interactive Mollier h-x diagram with enthalpy guidelines, absolute humidity scale, saturation curve and one-click HVAC cycle presets for cooling coils, evaporative cooling and air mixing.'
  },
  'steam-tables': {
    path: '/steam-tables',
    title: 'Saturated Steam Tables + Interpolator & T-s Diagram | PsychroLab',
    description:
      'Saturated water and steam property tables by temperature or pressure with an exact-value linear interpolation calculator, bounding-row highlighting, a T-s diagram and one-click Rankine cycle presets with a full state-point solver.'
  },
  'vapor-compression': {
    path: '/vapor-compression',
    title: 'Vapor Compression Cycle Calculator & p-h Diagram | PsychroLab',
    description:
      'Solve the four-state vapor compression cycle for any refrigerant: COP, state points, mass flow, compressor power and a live p-h diagram with one-click AC, chiller and heat-pump presets.'
  },
  'ph-chart': {
    path: '/ph-chart',
    title: 'Refrigerant p-h Diagram (Pressure–Enthalpy) | PsychroLab',
    description:
      'Interactive pressure–enthalpy diagram for R-134a, R-410A, R-22, ammonia, R-290 and R-32 with saturation dome, quality lines, hover inspector and PNG/SVG export.'
  },
  'cooling-load': {
    path: '/cooling-load',
    title: 'Cooling Load Calculator: Sensible, Latent & SHR | PsychroLab',
    description:
      'Room cooling load calculator covering occupants, lighting, equipment, fabric, infiltration and ventilation, with supply airflow, supply state, SHR and coil capacity in kW and tons.'
  },
  'duct-sizing': {
    path: '/duct-sizing',
    title: 'HVAC Duct Sizing Calculator (Equal Friction & Velocity) | PsychroLab',
    description:
      'ASHRAE equal-friction ductulator with Darcy-Weisbach and Colebrook-White sizing, round-to-rectangular conversion, velocity limits and SI/Imperial unit switching.'
  },
  'pipe-sizing': {
    path: '/pipe-sizing',
    title: 'Hydronic Pipe Sizing Calculator (Darcy–Weisbach) | PsychroLab',
    description:
      'Size chilled-water and heating-water pipes with Darcy–Weisbach and Colebrook–White friction, standard DN selection, velocity and pressure-gradient checks, pump head and power, and kW/tons capacity.',
    faq: [
      {
        q: 'Should hydronic pipe be sized by velocity or pressure gradient?',
        a: 'Velocity sizing controls noise and erosion and suits branches; pressure-gradient sizing between 100 and 400 Pa/m balances pipe cost against pump energy and is usual for mains. Size for the gradient, then check that velocity stays between about 0.6 and 2.4 m/s.'
      },
      {
        q: 'Why does water temperature change pipe pressure drop?',
        a: 'Viscosity falls from about 1.3 mPa·s at 10 °C to 0.47 mPa·s at 60 °C. The higher Reynolds number and lower friction factor mean the same pipe carries hot water with less pressure drop than chilled water.'
      }
    ]
  },
  'air-mixing': {
    path: '/air-mixing',
    title: 'Air Mixing & Coil Load Calculator with SHR | PsychroLab',
    description:
      'Mix two airstreams and find the mixed dry-bulb, humidity ratio and enthalpy, then size the cooling or dehumidification coil. Includes SHR, CFM to m³/s and kW to tons conversions.'
  },
  'wet-bulb': {
    path: '/wet-bulb',
    title: 'Wet Bulb Calculator (Dry Bulb & RH → Twb) | PsychroLab',
    description:
      'Calculate wet-bulb temperature from dry-bulb temperature and relative humidity using the ASHRAE adiabatic saturation formulation, with the full moist-air state and SI/IP output.',
    faq: [
      {
        q: 'How is wet-bulb temperature calculated?',
        a: 'Wet-bulb temperature is the temperature air reaches when water evaporates into it adiabatically. PsychroLab solves the ASHRAE saturation enthalpy balance by bisection, so the result matches the chart to within 0.1 K.'
      },
      {
        q: 'Why is wet bulb lower than dry bulb?',
        a: 'Evaporating water removes sensible heat from the air and returns it as latent heat. The drier the air, the more evaporation occurs, so the wet-bulb temperature falls further below the dry-bulb temperature.'
      }
    ]
  },
  'dew-point': {
    path: '/dew-point',
    title: 'Dew Point Calculator (Dry Bulb & RH) | PsychroLab',
    description:
      'Find the dew point from dry-bulb temperature and relative humidity using the ASHRAE saturation pressure curve. Includes condensation risk guidance and SI/IP results.',
    faq: [
      {
        q: 'What is dew point temperature?',
        a: 'Dew point is the temperature to which air must be cooled at constant humidity ratio before it becomes saturated. Below that temperature water condenses on surfaces.'
      },
      {
        q: 'What dew point is comfortable indoors?',
        a: 'ASHRAE comfort guidance keeps indoor dew point below roughly 16–17 °C. Higher dew points feel muggy and raise mould risk; dew points under 10 °C feel dry.'
      }
    ]
  },
  enthalpy: {
    path: '/enthalpy',
    title: 'Moist Air Enthalpy Calculator (kJ/kg & Btu/lb) | PsychroLab',
    description:
      'Calculate moist-air specific enthalpy from dry-bulb temperature and relative humidity with h = 1.006·T + W·(2501 + 1.86·T), shown in kJ/kg dry air and Btu/lb.',
    faq: [
      {
        q: 'What is moist air enthalpy?',
        a: 'Enthalpy is the total heat content per kilogram of dry air, combining sensible heat in the air and water vapour with the latent heat of the vapour. Coil loads are computed directly from enthalpy differences.'
      },
      {
        q: 'Why is enthalpy per kg of dry air?',
        a: 'Using dry air as the reference mass keeps the water-vapour term additive: adding moisture adds W·h_vapour without changing the dry-air basis, so mass balances stay simple.'
      }
    ]
  },
  'humidity-ratio': {
    path: '/humidity-ratio',
    title: 'Humidity Ratio Calculator (kg/kg & grains/lb) | PsychroLab',
    description:
      'Convert dry-bulb temperature and relative humidity to humidity ratio (absolute humidity) in kg/kg, g/kg and grains/lb, with the full psychrometric state.',
    faq: [
      {
        q: 'What is humidity ratio?',
        a: 'Humidity ratio W is the mass of water vapour per mass of dry air. Unlike relative humidity it does not change when air is heated or cooled without condensation, which makes it the basis for latent load calculations.'
      },
      {
        q: 'How do I convert humidity ratio to grains per pound?',
        a: 'Multiply kg/kg by 7000 to get grains per pound of dry air. For example 0.010 kg/kg is 70 gr/lb.'
      }
    ]
  },
  practice: {
    path: '/practice',
    title: 'Psychrometric Practice Problems with Chart Checking | PsychroLab',
    description:
      'Free student practice mode: randomly generated psychrometric problems — humidity ratio, enthalpy, dew point, wet bulb — verified by clicking the answer directly on an interactive chart.'
  }
};

function breadcrumb(key: string): Record<string, unknown> {
  const entry = SEO[key];
  const nameMap: Record<string, string> = {
    home: 'Home',
    'psych-chart': 'Psychrometric Chart',
    mollier: 'Mollier Diagram',
    'steam-tables': 'Steam Tables',
    'vapor-compression': 'Vapor Compression Cycle',
    'ph-chart': 'Refrigerant p-h Diagram',
    'cooling-load': 'Cooling Load Calculator',
    'duct-sizing': 'Duct Sizing',
    'pipe-sizing': 'Hydronic Pipe Sizing',
    'air-mixing': 'Air Mixing',
    'wet-bulb': 'Wet Bulb Calculator',
    'dew-point': 'Dew Point Calculator',
    enthalpy: 'Enthalpy Calculator',
    'humidity-ratio': 'Humidity Ratio Calculator',
    practice: 'Practice Mode'
  };
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      ...(key === 'home'
        ? []
        : [{ '@type': 'ListItem', position: 2, name: nameMap[key] ?? entry.title, item: `${SITE_URL}${entry.path}` }])
    ]
  };
}

export function jsonLd(key: string): Record<string, unknown> {
  const entry = SEO[key];
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebApplication',
      name: entry.title.split('|')[0].trim(),
      url: `${SITE_URL}${entry.path}`,
      description: entry.description,
      applicationCategory: 'EngineeringApplication',
      operatingSystem: 'Any (browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@type': 'Organization', name: 'PsychroLab', url: SITE_URL }
    },
    breadcrumb(key)
  ];

  if (entry.faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: entry.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a }
      }))
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

/** Serialised <script> tag, safe against closing-tag injection. */
export function jsonLdScriptTag(key: string): string {
  return `<script type="application/ld+json">${JSON.stringify(jsonLd(key)).replace(/</g, '\\u003c')}</script>`;
}
