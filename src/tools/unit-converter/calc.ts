type UnitMap = Record<string, number>

export const groups: Record<string, UnitMap> = {
  length: {
    m: 1,
    cm: 100,
    mm: 1000,
    km: 0.001,
    in: 39.3701,
    ft: 3.28084,
    yd: 1.09361,
    mi: 0.000621371,
  },
  weight: {
    kg: 1,
    g: 1000,
    lb: 2.20462,
    oz: 35.274,
    ton: 0.001,
  },
  volume: {
    l: 1,
    ml: 1000,
    gal: 0.264172,
    qt: 1.05669,
    pt: 2.11338,
    cup: 4.22675,
    floz: 33.814,
  },
  area: {
    sqm: 1,
    sqcm: 10000,
    sqkm: 0.000001,
    sqft: 10.7639,
    sqin: 1550,
    acre: 0.000247105,
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

export function convert(
  value: number,
  from: string,
  to: string,
  group: string
): number {
  const map = groups[group]
  return (value / map[from]) * map[to]
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
