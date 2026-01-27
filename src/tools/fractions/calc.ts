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
