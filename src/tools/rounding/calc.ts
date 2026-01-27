export type RoundingMode = "place" | "decimal" | "multiple"

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
