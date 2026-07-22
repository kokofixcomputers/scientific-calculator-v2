export interface ScaleDimensionInput {
  label: string
  real: number
  model?: number // leave undefined for dimensions that need to be computed
}

export interface ScaleDimensionResult {
  label: string
  real: number
  model: number
}

export interface ScaleModelResult {
  scaleFactor: number
  dimensions: ScaleDimensionResult[]
}

// Given a set of real-world dimensions where at least one also has a known model
// dimension, derives the scale factor and fills in the model value for every other one.
// e.g. real height 400ft -> model height 4ft gives factor 1/100, then a 50ft width -> 0.5ft model width
export function calculateScaleModel(dims: ScaleDimensionInput[]): ScaleModelResult | null {
  const known = dims.find(d => d.model !== undefined && !isNaN(d.model) && d.real !== 0)
  if (!known) return null

  const scaleFactor = known.model! / known.real

  return {
    scaleFactor,
    dimensions: dims.map(d => ({
      label: d.label,
      real: d.real,
      model: d.model !== undefined && !isNaN(d.model) ? d.model : d.real * scaleFactor,
    })),
  }
}

// Map scale "1 in : 500 yd" -> converts a distance measured on the map to the real-world distance
export function mapToActual(mapScaleValue: number, actualScaleValue: number, mapDistance: number): number {
  if (mapScaleValue === 0) return NaN
  return mapDistance * (actualScaleValue / mapScaleValue)
}

// Map scale "1 in : 500 yd" -> converts a real-world distance to the equivalent distance on the map
export function actualToMap(mapScaleValue: number, actualScaleValue: number, actualDistance: number): number {
  if (actualScaleValue === 0) return NaN
  return actualDistance * (mapScaleValue / actualScaleValue)
}
