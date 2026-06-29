export type RoundingMode = "place" | "decimal" | "multiple"

/**
 * Parse a mixed number (e.g., "2 3/5") or fraction (e.g., "3/5") to decimal
 */
export function parseFractionOrMixed(input: string): number | null {
  const trimmed = input.trim()
  
  // Handle mixed numbers (e.g., "2 3/5")
  if (trimmed.includes(" ") && trimmed.includes("/")) {
    const parts = trimmed.split(" ")
    const whole = Number(parts[0])
    const [n, d] = parts[1].split("/").map(Number)
    if (isNaN(whole) || isNaN(n) || isNaN(d) || d === 0) return null
    return whole + (n / d)
  }
  
  // Handle regular fractions (e.g., "3/5")
  if (trimmed.includes("/")) {
    const [n, d] = trimmed.split("/").map(Number)
    if (isNaN(n) || isNaN(d) || d === 0) return null
    return n / d
  }
  
  // Handle regular numbers
  const num = Number(trimmed)
  return isNaN(num) ? null : num
}

/**
 * Convert decimal to fraction
 */
export function decimalToFraction(value: number): [number, number] {
  if (!isFinite(value)) return [NaN, NaN]
  const str = value.toString()
  if (!str.includes(".")) return [value, 1]

  const decimals = str.split(".")[1].length
  const denom = Math.pow(10, decimals)
  const num = Math.round(value * denom)

  return simplifyFraction(num, denom)
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

function simplifyFraction(n: number, d: number): [number, number] {
  if (d === 0) return [NaN, NaN]
  const g = gcd(n, d)
  return [n / g, d / g]
}

/**
 * Convert decimal to mixed number
 */
export function decimalToMixedNumber(value: number): [number, number, number] {
  const [n, d] = decimalToFraction(value)
  const whole = Math.floor(n / d)
  const remainder = Math.abs(n % d)
  return [whole, remainder, d]
}

/**
 * Round to place value (ones, tens, hundreds, etc.)
 * place = 1 | 10 | 100 | 1000 ...
 */
export function roundToPlace(value: number, place: number): number {
  if (!isFinite(value) || !isFinite(place) || place === 0) return NaN
  return Math.round(value / place) * place
}

/**
 * Round to number of decimal places
 * decimals = 0..10
 */
export function roundToDecimals(value: number, decimals: number): number {
  if (!isFinite(value) || !isFinite(decimals)) return NaN
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Round to nearest multiple
 * multiple can be any non-zero number
 */
export function roundToMultiple(value: number, multiple: number): number {
  if (!isFinite(value) || !isFinite(multiple) || multiple === 0) return NaN
  return Math.round(value / multiple) * multiple
}
