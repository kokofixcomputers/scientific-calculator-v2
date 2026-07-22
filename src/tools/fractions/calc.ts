function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

export function simplifyFraction(n: number, d: number): [number, number] {
  if (d === 0) return [NaN, NaN]
  const g = gcd(n, d)
  return [n / g, d / g]
}

export function decimalToFraction(value: number): [number, number] {
  if (!isFinite(value)) return [NaN, NaN]
  const str = value.toString()
  if (!str.includes(".")) return [value, 1]

  const decimals = str.split(".")[1].length
  const denom = Math.pow(10, decimals)
  const num = Math.round(value * denom)

  return simplifyFraction(num, denom)
}

export function toMixedNumber(n: number, d: number): [number, number, number] {
  const whole = Math.floor(n / d)
  const remainder = Math.abs(n % d)
  return [whole, remainder, d]
}

export function toImproperFraction(
  whole: number,
  n: number,
  d: number
): [number, number] {
  return [whole * d + n, d]
}

export function fractionToDecimal(n: number, d: number): number {
  return d === 0 ? NaN : n / d
}

export function fractionToPercent(n: number, d: number): number {
  return fractionToDecimal(n, d) * 100
}

export function percentToFraction(percent: number): [number, number] {
  return decimalToFraction(percent / 100)
}

export function percentToMixed(percent: number): [number, number, number] {
  const [n, d] = percentToFraction(percent)
  return toMixedNumber(n, d)
}

// "12 is what fraction of 18?" -> simplify(12, 18) -> 2/3
export function whatFractionOf(part: number, whole: number): [number, number] {
  return simplifyFraction(part, whole)
}

// "What is 3/7 of 56?" -> (3/7) * 56 -> 24
export function fractionOfNumber(n: number, d: number, whole: number): number {
  return d === 0 ? NaN : (n / d) * whole
}

// "14 is 7/12 of what number?" -> 14 / (7/12) -> 24
export function findWholeFromFraction(part: number, n: number, d: number): number {
  return n === 0 ? NaN : (part * d) / n
}
