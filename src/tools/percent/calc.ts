// "54 is what percent of 120?" -> 45
export function percentOf(part: number, whole: number): number {
  if (whole === 0) return NaN
  return (part / whole) * 100
}

// "What is 45% of 120?" -> 54
export function valueFromPercent(percent: number, whole: number): number {
  return (percent / 100) * whole
}

// "14 is 15% of what number?" -> 93.33
export function findWhole(part: number, percent: number): number {
  if (percent === 0) return NaN
  return part / (percent / 100)
}

// Percent change from one value to another, e.g. 50 -> 75 is +50%
export function percentChange(from: number, to: number): number {
  if (from === 0) return NaN
  return ((to - from) / from) * 100
}

// Increase/decrease a value by a percent, e.g. 200 increased by 10% -> 220
export function applyPercentChange(value: number, percent: number, direction: "increase" | "decrease"): number {
  const factor = direction === "increase" ? 1 + percent / 100 : 1 - percent / 100
  return value * factor
}
