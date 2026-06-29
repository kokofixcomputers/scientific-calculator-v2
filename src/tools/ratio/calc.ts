function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

export function simplifyRatio(a: number, b: number): [number, number] {
  if (a === 0 && b === 0) return [0, 0]
  if (a === 0) return [0, 1]
  if (b === 0) return [1, 0]
  
  const g = gcd(a, b)
  return [a / g, b / g]
}

export function findMissingValue(a: number, b: number, c: number): number {
  // Solves a:b = c:x  =>  x = (b * c) / a
  if (a === 0) return NaN
  return (b * c) / a
}

export function scaleRatio(a: number, b: number, factor: number): [number, number] {
  return [a * factor, b * factor]
}

export function ratioToDecimal(a: number, b: number): number {
  if (b === 0) return NaN
  return a / b
}

export function ratioToPercent(a: number, b: number): number {
  return ratioToDecimal(a, b) * 100
}

export function compareRatios(a1: number, b1: number, a2: number, b2: number): string {
  const r1 = ratioToDecimal(a1, b1)
  const r2 = ratioToDecimal(a2, b2)
  
  if (isNaN(r1) || isNaN(r2)) return "Invalid"
  
  if (Math.abs(r1 - r2) < 0.000001) return "Equal"
  return r1 > r2 ? "First is greater" : "Second is greater"
}
