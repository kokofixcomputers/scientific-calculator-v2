type UnitMap = Record<string, number>

// Standard metric prefixes, including the rarely-used middle ones (hecto, deca, deci, centi)
// that get skipped when people only remember kilo/centi/milli
const METRIC_PREFIXES: { symbol: string; factor: number }[] = [
  { symbol: "M", factor: 1e6 },
  { symbol: "k", factor: 1e3 },
  { symbol: "h", factor: 1e2 },
  { symbol: "da", factor: 1e1 },
  { symbol: "d", factor: 1e-1 },
  { symbol: "c", factor: 1e-2 },
  { symbol: "m", factor: 1e-3 },
  { symbol: "µ", factor: 1e-6 },
]

// Builds every prefixed variant of a base metric unit (e.g. "g" -> g, kg, hg, mg, µg, ...)
// The map stores "units per 1 base unit", matching the convention used by `convert`
function buildMetricUnits(baseSymbol: string): UnitMap {
  const map: UnitMap = { [baseSymbol]: 1 }
  for (const { symbol, factor } of METRIC_PREFIXES) {
    map[symbol + baseSymbol] = 1 / factor
  }
  return map
}

export const groups: Record<string, UnitMap> = {
  length: {
    ...buildMetricUnits("m"),
    // Exact international-foot definitions, so e.g. 12in + 12ft carries over to a clean 13ft
    in: 1 / 0.0254,
    ft: 1 / 0.3048,
    yd: 1 / 0.9144,
    mi: 1 / 1609.344,
  },
  weight: {
    ...buildMetricUnits("g"),
    // Exact avoirdupois definitions (1 lb = 453.59237 g, 1 oz = 1/16 lb)
    lb: 1 / 453.59237,
    oz: 1 / 28.349523125,
    ton: 1 / 907184.74,
  },
  volume: {
    ...buildMetricUnits("l"),
    // Exact US liquid measures (1 gal = 3.785411784 L, with qt/pt/cup/floz as clean fractions of it)
    gal: 1 / 3.785411784,
    qt: 4 / 3.785411784,
    pt: 8 / 3.785411784,
    cup: 16 / 3.785411784,
    floz: 128 / 3.785411784,
  },
  area: {
    sqm: 1,
    sqmm: 1e6,
    sqcm: 1e4,
    sqkm: 1e-6,
    // Derived from the exact international-foot definitions (1 in = 0.0254 m, etc.)
    // rather than rounded conversion factors, so e.g. 864 sqin -> sqft lands on exactly 6.
    sqin: 1 / 0.0254 ** 2,
    sqft: 1 / 0.3048 ** 2,
    sqyd: 1 / 0.9144 ** 2,
    sqmi: 1 / 1609.344 ** 2,
    acre: 1 / 4046.8564224,
    hectare: 1 / 10000,
  },
  speed: {
    mps: 1,
    kph: 3.6,
    mph: 2.23694,
    fps: 3.28084,
    knot: 1.94384,
  },
  time: {
    s: 1,
    min: 1 / 60,
    hr: 1 / 3600,
    day: 1 / 86400,
    week: 1 / 604800,
    month: 1 / 2629746,
    year: 1 / 31556952,
  },
  digital: {
    byte: 1,
    kb: 1 / 1000,
    mb: 1 / (1000 ** 2),
    gb: 1 / (1000 ** 3),
    tb: 1 / (1000 ** 4),
    pb: 1 / (1000 ** 5),
  },
  biblical: {
    cubit: 1,
    span: 2,
    handbreadth: 6,
    finger: 24,
  },
}

// Strips IEEE-754 float dust (e.g. 5.999999999999999) left over from chained division/multiplication
function cleanFloat(n: number): number {
  return Number.isFinite(n) ? Number(n.toPrecision(12)) : n
}

export function convert(
  value: number,
  from: string,
  to: string,
  group: string
): number {
  const map = groups[group]
  return cleanFloat((value / map[from]) * map[to])
}

export function convertTemperature(
  value: number,
  from: string,
  to: string
): number {
  if (from === to) return value

  let c =
    from === "C" ? value :
    from === "F" ? (value - 32) * 5 / 9 :
    value - 273.15

  return to === "C"
    ? c
    : to === "F"
    ? c * 9 / 5 + 32
    : c + 273.15
}
