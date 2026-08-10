// Splits a side of the equation into signed terms at top-level +/-, e.g.
// "-x+1" -> ["-x", "+1"], "2x-3y" -> ["+2x", "-3y"]
function tokenizeSum(expr: string): string[] {
  const tokens: string[] = []
  let current = ''

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i]
    if (char === '+' || (char === '-' && i > 0)) {
      if (current) tokens.push(current)
      current = char
    } else {
      current += char
    }
  }
  if (current) tokens.push(current)

  return tokens
    .filter(t => t && t !== '+' && t !== '-')
    .map(t => (t.startsWith('+') || t.startsWith('-') ? t : '+' + t))
}

interface LinearTerms {
  x: number
  y: number
  constant: number
}

function evaluateSide(expr: string): LinearTerms | null {
  if (!expr) return null
  const tokens = tokenizeSum(expr)
  let x = 0
  let y = 0
  let constant = 0

  for (const token of tokens) {
    const sign = token[0] === '-' ? -1 : 1
    const term = token.slice(1)
    if (!term) return null

    if (term === 'x') { x += sign; continue }
    if (term === 'y') { y += sign; continue }

    // Fraction coefficient attached to x or y, e.g. "2/3x" means (2/3)*x
    const fracVarMatch = term.match(/^(\d+\.?\d*)\/(\d+\.?\d*)([xy])$/)
    if (fracVarMatch) {
      const [, n, d, v] = fracVarMatch
      const num = Number(n)
      const den = Number(d)
      if (isNaN(num) || isNaN(den) || den === 0) return null
      const coeff = sign * (num / den)
      if (v === 'x') x += coeff; else y += coeff
      continue
    }

    // Plain fraction constant, e.g. "3/4"
    const fracMatch = term.match(/^(\d+\.?\d*)\/(\d+\.?\d*)$/)
    if (fracMatch) {
      const num = Number(fracMatch[1])
      const den = Number(fracMatch[2])
      if (isNaN(num) || isNaN(den) || den === 0) return null
      constant += sign * (num / den)
      continue
    }

    // Coefficient directly attached to x or y, e.g. "3x", "2y"
    const coeffVarMatch = term.match(/^(\d+\.?\d*)([xy])$/)
    if (coeffVarMatch) {
      const coeff = sign * Number(coeffVarMatch[1])
      if (coeffVarMatch[2] === 'x') x += coeff; else y += coeff
      continue
    }

    const num = Number(term)
    if (isNaN(num)) return null
    constant += sign * num
  }

  return { x, y, constant }
}

export interface LineInfo {
  slope: number | null // null for a vertical line (undefined slope)
  yIntercept: number | null // null if the line never crosses the y-axis at a single point (vertical, not x=0)
  xIntercept: number | null // null if the line never crosses the x-axis at a single point (horizontal, not y=0)
  isVertical: boolean
  isHorizontal: boolean
  verticalX?: number // x = c, only set when isVertical
  equation: string // normalized, e.g. "y = -x + 1"
}

// Rounds to 4 decimal places (plenty for display/graphing) and turns -0 into 0
function cleanNumber(n: number): number {
  if (!Number.isFinite(n)) return n
  const rounded = Math.round(n * 1e4) / 1e4
  return rounded === 0 ? 0 : rounded
}

function formatEquation(slope: number, yIntercept: number): string {
  const slopeTerm =
    slope === 0 ? '' :
    slope === 1 ? 'x' :
    slope === -1 ? '-x' :
    `${slope}x`

  if (slope === 0) return `y = ${yIntercept}`

  const sign = yIntercept === 0 ? '' : yIntercept > 0 ? ` + ${yIntercept}` : ` - ${Math.abs(yIntercept)}`
  return `y = ${slopeTerm}${sign}`
}

export function analyzeLine(input: string): LineInfo | { error: string } {
  const cleaned = input.replace(/\s+/g, '').replace(/×/g, '*').replace(/[()]/g, '')
  const parts = cleaned.split('=')
  if (parts.length !== 2) return { error: 'Enter an equation with one "=", e.g. y = -x + 1' }

  const left = evaluateSide(parts[0])
  const right = evaluateSide(parts[1])
  if (!left || !right) return { error: 'Could not parse the equation' }

  // Move everything to one side: coeffX*x + coeffY*y + constant = 0
  const coeffX = left.x - right.x
  const coeffY = left.y - right.y
  const constant = left.constant - right.constant

  if (coeffX === 0 && coeffY === 0) {
    return { error: constant === 0 ? 'Every point is a solution (not a single line)' : 'No solution - not a valid line' }
  }

  if (coeffY === 0) {
    // Vertical line: coeffX*x + constant = 0 -> x = -constant/coeffX
    const verticalX = cleanNumber(-constant / coeffX)
    return {
      slope: null,
      yIntercept: null,
      xIntercept: verticalX,
      isVertical: true,
      isHorizontal: false,
      verticalX,
      equation: `x = ${verticalX}`,
    }
  }

  const rawSlope = -coeffX / coeffY
  const rawYIntercept = -constant / coeffY
  const rawXIntercept = rawSlope === 0 ? null : -rawYIntercept / rawSlope

  const slope = cleanNumber(rawSlope)
  const yIntercept = cleanNumber(rawYIntercept)
  const xIntercept = rawXIntercept === null ? null : cleanNumber(rawXIntercept)

  return {
    slope,
    yIntercept,
    xIntercept,
    isVertical: false,
    isHorizontal: slope === 0,
    equation: formatEquation(slope, yIntercept),
  }
}

function lineFromVerticalX(x: number): LineInfo {
  const verticalX = cleanNumber(x)
  return {
    slope: null,
    yIntercept: null,
    xIntercept: verticalX,
    isVertical: true,
    isHorizontal: false,
    verticalX,
    equation: `x = ${verticalX}`,
  }
}

// Builds y = mx + b directly from a slope and y-intercept
export function lineFromSlopeIntercept(m: number, b: number): LineInfo {
  const slope = cleanNumber(m)
  const yIntercept = cleanNumber(b)
  return {
    slope,
    yIntercept,
    xIntercept: slope === 0 ? null : cleanNumber(-yIntercept / slope),
    isVertical: false,
    isHorizontal: slope === 0,
    equation: formatEquation(slope, yIntercept),
  }
}

// Slope + equation from two points, e.g. (1,2) and (3,6) -> slope 2, y = 2x
export function lineFromTwoPoints(x1: number, y1: number, x2: number, y2: number): LineInfo | { error: string } {
  if (x1 === x2) {
    if (y1 === y2) return { error: 'That\'s a single point, not a line - the two points must be different' }
    return lineFromVerticalX(x1)
  }
  const m = (y2 - y1) / (x2 - x1)
  const b = y1 - m * x1
  return lineFromSlopeIntercept(m, b)
}

// Equation from a single point and a known slope, e.g. point (2,3) with slope 4 -> y = 4x - 5
export function lineFromPointSlope(x1: number, y1: number, m: number | null): LineInfo {
  if (m === null) return lineFromVerticalX(x1)
  const b = y1 - m * x1
  return lineFromSlopeIntercept(m, b)
}

export interface ParallelPerpendicularResult {
  parallelSlope: number | null
  perpendicularSlope: number | null
}

// A parallel line keeps the same slope; a perpendicular line's slope is the negative reciprocal
// (a vertical line's "slope" is undefined, and its perpendicular is a horizontal line, slope 0)
export function findParallelAndPerpendicularSlope(m: number | null): ParallelPerpendicularResult {
  if (m === null) return { parallelSlope: null, perpendicularSlope: 0 }
  if (m === 0) return { parallelSlope: 0, perpendicularSlope: null }
  return { parallelSlope: cleanNumber(m), perpendicularSlope: cleanNumber(-1 / m) }
}
