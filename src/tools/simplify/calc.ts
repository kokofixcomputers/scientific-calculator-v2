// Tokenizes "12+5x-18-x" into signed terms: ["+12", "+5x", "-18", "-x"]
function tokenize(expr: string): string[] {
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

interface Term {
  coeff: number
  variable?: string
}

// Parses a signed token (e.g. "+5x", "-18") into a coefficient/variable pair
function parseTerm(token: string): Term | null {
  const sign = token[0] === '-' ? -1 : 1
  const body = token.slice(1)

  const match = body.match(/^(\d+\.?\d*(?:\/\d+\.?\d*)?)?([a-zA-Z])?$/)
  if (!match) return null

  const [, coeffStr, variable] = match
  const coeff = parseCoefficient(coeffStr ?? '')
  if (coeff === null) return null

  return { coeff: sign * coeff, variable }
}

function parseCoefficient(value: string): number | null {
  if (value === '') return 1
  if (value.includes('/')) {
    const [n, d] = value.split('/').map(Number)
    if (isNaN(n) || isNaN(d) || d === 0) return null
    return n / d
  }
  const n = parseFloat(value)
  return isNaN(n) ? null : n
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : String(parseFloat(n.toFixed(4)))
}

function termToToken(term: Term): string {
  const coeffPart = Math.abs(term.coeff) === 1 && term.variable ? '' : formatNumber(Math.abs(term.coeff))
  return `${term.coeff < 0 ? '-' : '+'}${coeffPart}${term.variable ?? ''}`
}

// Resolves parenthesized groups by distributing the preceding sign/coefficient
// across every term inside, e.g. "5+3(x-2)" -> "5+3x-6", "-9+(-6)" -> "-9-6"
function expandParens(expr: string): string | null {
  const parenRegex = /([+-]?\d*\.?\d*)\(([^()]+)\)/
  let result = expr
  let guard = 0

  while (result.includes('(')) {
    if (++guard > 100) return null
    const match = result.match(parenRegex)
    if (!match || match.index === undefined) return null

    const [full, prefix, inner] = match
    let multiplier: number
    if (prefix === '' || prefix === '+') multiplier = 1
    else if (prefix === '-') multiplier = -1
    else {
      const parsed = parseFloat(prefix)
      if (isNaN(parsed)) return null
      multiplier = parsed
    }

    const innerTokens = tokenize(inner)
    if (innerTokens.length === 0) return null

    const distributedTerms: Term[] = []
    for (const token of innerTokens) {
      const term = parseTerm(token)
      if (!term) return null
      distributedTerms.push({ coeff: term.coeff * multiplier, variable: term.variable })
    }

    const replacement = distributedTerms.map(termToToken).join('')
    result = result.slice(0, match.index) + replacement + result.slice(match.index + full.length)
  }

  return result
}

// Combines like terms in a linear expression, e.g. "12+5x-18-x" -> "4x - 6"
export function simplifyExpression(expr: string): string {
  const cleaned = expr.replace(/\s+/g, '').replace(/×/g, '*').replace(/\*/g, '')
  if (cleaned === '') return 'Enter an expression'

  const expanded = expandParens(cleaned)
  if (expanded === null) return 'Could not parse the expression'

  const tokens = tokenize(expanded)
  if (tokens.length === 0) return 'Enter an expression'

  const varCoeffs: Record<string, number> = {}
  let constant = 0

  for (const token of tokens) {
    const term = parseTerm(token)
    if (!term) return `Could not parse term: "${token.slice(1)}"`

    if (term.variable) {
      varCoeffs[term.variable] = (varCoeffs[term.variable] ?? 0) + term.coeff
    } else {
      constant += term.coeff
    }
  }

  const parts: string[] = []
  const variables = Object.keys(varCoeffs).sort()

  for (const v of variables) {
    const c = varCoeffs[v]
    if (c === 0) continue
    const coeffPart = Math.abs(c) === 1 ? '' : formatNumber(Math.abs(c))
    parts.push(`${c < 0 ? '-' : '+'}${coeffPart}${v}`)
  }

  if (constant !== 0 || parts.length === 0) {
    parts.push(`${constant < 0 ? '-' : '+'}${formatNumber(Math.abs(constant))}`)
  }

  let result = parts.join(' ').replace(/^\+/, '')
  result = result.replace(/ \+/g, ' + ').replace(/ -/g, ' - ')

  return result
}
