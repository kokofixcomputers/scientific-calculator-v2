function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

// Parses "3", "3.5", "3/5", or "3 1/2" (mixed number) into a [numerator, denominator] pair
export function parseFraction(input: string): [number, number] {
  const trimmed = input.trim()
  if (trimmed === "") return [NaN, NaN]

  const mixedMatch = trimmed.match(/^(-?\d+)\s+(\d+)\/(\d+)$/)
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10)
    const num = parseInt(mixedMatch[2], 10)
    const den = parseInt(mixedMatch[3], 10)
    if (den === 0) return [NaN, NaN]
    const sign = whole < 0 ? -1 : 1
    return [sign * (Math.abs(whole) * den + num), den]
  }

  const fracMatch = trimmed.match(/^(-?\d+)\/(-?\d+)$/)
  if (fracMatch) {
    const num = parseInt(fracMatch[1], 10)
    const den = parseInt(fracMatch[2], 10)
    if (den === 0) return [NaN, NaN]
    return [num, den]
  }

  const value = Number(trimmed)
  if (isNaN(value)) return [NaN, NaN]
  if (Number.isInteger(value)) return [value, 1]

  const decimals = value.toString().split(".")[1]?.length ?? 0
  const denom = Math.pow(10, decimals)
  return [Math.round(value * denom), denom]
}

export function simplifyFraction(n: number, d: number): [number, number] {
  if (d === 0) return [NaN, NaN]
  if (n === 0) return [0, 1]
  const sign = d < 0 ? -1 : 1
  const g = gcd(n, d) || 1
  return [(sign * n) / g, (sign * d) / g]
}

export function toMixedNumber(n: number, d: number): [number, number, number] {
  const whole = Math.trunc(n / d)
  const remainder = Math.abs(n % d)
  return [whole, remainder, d]
}

export function formatFraction(n: number, d: number): string {
  if (isNaN(n) || isNaN(d)) return "—"
  const [sn, sd] = simplifyFraction(n, d)
  if (sd === 1) return String(sn)
  const [whole, rem, den] = toMixedNumber(sn, sd)
  if (rem === 0) return String(whole)
  if (whole === 0) return `${sn}/${sd}`
  return `${whole} ${rem}/${den}`
}

export interface UnitRateResult {
  numerator: number
  denominator: number
  decimal: number
  fraction: string
}

// Computes the unit rate (quantity1 / quantity2), where each quantity may be
// a whole number, decimal, fraction ("3/5") or mixed number ("3 1/2")
export function computeUnitRate(qty1: string, qty2: string): UnitRateResult | null {
  const [n1, d1] = parseFraction(qty1)
  const [n2, d2] = parseFraction(qty2)
  if (isNaN(n1) || isNaN(d1) || isNaN(n2) || isNaN(d2) || n2 === 0) return null

  // (n1/d1) / (n2/d2) = (n1*d2) / (d1*n2)
  const rateN = n1 * d2
  const rateD = d1 * n2
  const [simpN, simpD] = simplifyFraction(rateN, rateD)

  return {
    numerator: simpN,
    denominator: simpD,
    decimal: simpN / simpD,
    fraction: formatFraction(simpN, simpD),
  }
}

export interface RateTableRow {
  multiplier: number
  quantity1: number
  quantity2: number
}

// Builds an equivalent-rates table by scaling the per-unit rate (qty1 per 1 qty2)
// across the given multipliers (defaults to 1..10)
export function generateRateTable(
  unitQuantity1: number,
  multipliers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
): RateTableRow[] {
  return multipliers.map(m => ({
    multiplier: m,
    quantity1: unitQuantity1 * m,
    quantity2: m,
  }))
}
