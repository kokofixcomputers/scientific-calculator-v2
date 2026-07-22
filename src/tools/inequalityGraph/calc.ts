// Strips IEEE-754 float dust (e.g. 3.4999999999999996) left over from chained division
function cleanFloat(n: number): number {
  return Number.isFinite(n) ? Number(n.toPrecision(12)) : n
}

// Splits a side of the inequality into signed terms at top-level +/-, e.g.
// "3x+1" -> ["+3x", "+1"], "-x-5" -> ["-x", "-5"]
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

function evaluateSide(expr: string, variable: string): { varCoeff: number; constant: number } | null {
  if (!expr) return null
  const tokens = tokenizeSum(expr)
  let varCoeff = 0
  let constant = 0

  for (const token of tokens) {
    const sign = token[0] === '-' ? -1 : 1
    const term = token.slice(1)
    if (!term) return null

    if (term === variable) {
      varCoeff += sign
      continue
    }

    // Fraction coefficient attached to the variable, e.g. "2/3x" means (2/3)*x
    const fracVarMatch = term.match(/^(\d+\.?\d*)\/(\d+\.?\d*)([a-zA-Z])$/)
    if (fracVarMatch) {
      const [, n, d, v] = fracVarMatch
      if (v !== variable) return null
      const num = Number(n)
      const den = Number(d)
      if (isNaN(num) || isNaN(den) || den === 0) return null
      varCoeff += sign * (num / den)
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

    // Coefficient directly attached to the variable, e.g. "3x"
    const coeffVarMatch = term.match(/^(\d+\.?\d*)([a-zA-Z])$/)
    if (coeffVarMatch) {
      if (coeffVarMatch[2] !== variable) return null
      varCoeff += sign * Number(coeffVarMatch[1])
      continue
    }

    const num = Number(term)
    if (isNaN(num)) return null
    constant += sign * num
  }

  return { varCoeff, constant }
}

type Operator = '<' | '>' | '<=' | '>='

function flip(op: Operator): Operator {
  return op === '<' ? '>' : op === '>' ? '<' : op === '<=' ? '>=' : '<='
}

function holdsForZero(op: Operator, b: number): boolean {
  switch (op) {
    case '<': return 0 < b
    case '>': return 0 > b
    case '<=': return 0 <= b
    case '>=': return 0 >= b
  }
}

export interface InequalitySolution {
  text: string
  variable?: string
  boundary?: number
  inclusive?: boolean
  direction?: 'left' | 'right'
}

export function solveInequality(input: string): InequalitySolution {
  const cleaned = input.replace(/\s+/g, '').replace(/×/g, '*').replace(/[()]/g, '')

  let op: Operator | null = null
  let opIndex = -1
  for (const candidate of ['<=', '>=', '<', '>'] as Operator[]) {
    const idx = cleaned.indexOf(candidate)
    if (idx !== -1) {
      op = candidate
      opIndex = idx
      break
    }
  }
  if (!op) return { text: 'No inequality operator (<, >, <=, >=) found' }

  const left = cleaned.slice(0, opIndex)
  const right = cleaned.slice(opIndex + op.length)

  const variables = new Set((cleaned.match(/[a-zA-Z]/g) || []))
  if (variables.size === 0) return { text: 'No variable found' }
  if (variables.size > 1) {
    return { text: `Multiple variables detected: ${Array.from(variables).join(', ')}. This tool solves single-variable inequalities.` }
  }
  const variable = Array.from(variables)[0]

  const leftVal = evaluateSide(left, variable)
  const rightVal = evaluateSide(right, variable)
  if (!leftVal || !rightVal) return { text: 'Could not parse the inequality' }

  // a*x <op> b, after moving every term to one side
  const a = leftVal.varCoeff - rightVal.varCoeff
  const b = rightVal.constant - leftVal.constant

  if (a === 0) {
    return holdsForZero(op, b)
      ? { text: 'All real numbers are solutions' }
      : { text: 'No solution' }
  }

  // Dividing by a negative coefficient flips the inequality direction
  const finalOp = a < 0 ? flip(op) : op
  const boundary = cleanFloat(b / a)
  const inclusive = finalOp === '<=' || finalOp === '>='
  const direction: 'left' | 'right' = finalOp === '<' || finalOp === '<=' ? 'left' : 'right'

  return {
    text: `${variable} ${finalOp} ${boundary}`,
    variable,
    boundary,
    inclusive,
    direction,
  }
}
