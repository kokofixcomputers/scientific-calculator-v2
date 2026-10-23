function cleanEquation(equation: string): string {
  // Convert mixed numbers ("1 1/3") to an improper fraction ("4/3") before any
  // whitespace is stripped, otherwise "1 1/3" collapses into the wrong number "11/3"
  const mixedNumbersConverted = equation.replace(/(\d+)\s+(\d+)\/(\d+)/g, (_, whole, num, den) => {
    const w = parseInt(whole, 10)
    const n = parseInt(num, 10)
    const d = parseInt(den, 10)
    return `${w * d + n}/${d}`
  })

  return mixedNumbersConverted
    .replace(/\s+/g, '')
    .replace(/\*/g, '*')
    .replace(/×/g, '*')
    .replace(/[()]/g, '') // equations here are linear with no nested grouping, so "(2/3)a" is just "2/3a"
    .replace(/([a-zA-Z0-9.]+)%/g, '0.01*$1')
}

// Lists the distinct variable letters in an equation, in first-seen order, so the UI can
// offer a picker when there's more than one (e.g. "x, t" in "x + t = 10")
export function extractVariables(equation: string): string[] {
  const cleaned = cleanEquation(equation)
  const matches = cleaned.match(/[a-zA-Z]/g)
  return matches ? Array.from(new Set(matches)) : []
}

export function solveEquation(equation: string, forVariable?: string): string {
  const cleaned = cleanEquation(equation)
  const parts = cleaned.split('=')
  if (parts.length !== 2) return 'Invalid equation format'

  const [left, right] = parts
  const variables = new Set<string>()

  // Extract variables (single letters)
  const varRegex = /[a-zA-Z]/g
  ;[left, right].forEach(side => {
    const matches = side.match(varRegex)
    if (matches) matches.forEach(v => variables.add(v))
  })

  if (variables.size === 0) return 'No variables found'

  if (forVariable) {
    if (!variables.has(forVariable)) return `"${forVariable}" does not appear in this equation`
    return solveForSingleVariable(left, right, forVariable)
  }

  if (variables.size > 1) {
    const varArray = Array.from(variables)
    // No variable was specified - try each one and use whichever actually solves
    for (const v of varArray) {
      const result = trySolveFor(left, right, v)
      if (!result.startsWith('Error') && !result.startsWith("Can't isolate")) return result
    }
    return `Multiple variables detected: ${varArray.join(', ')}. Select one to solve for.`
  }

  return solveForSingleVariable(left, right, Array.from(variables)[0])
}

function solveForSingleVariable(left: string, right: string, variable: string): string {
  // Check if this is a proportion equation (fraction = fraction with variable)
  // e.g., "115/100=1426/p"
  const leftFrac = left.match(/^(\d+\.?\d*\/\d+\.?\d*)$/)
  const rightFrac = right.match(/^(\d+\.?\d*\/\d+\.?\d*)$/)

  if (leftFrac && rightFrac) {
    return solveProportion(left, right, variable)
  }

  // Check if one side is a fraction and the other is a fraction with variable
  const leftFracWithVar = left.match(/^(\d+\.?\d*)\/([a-zA-Z])$/)
  const rightFracWithVar = right.match(/^(\d+\.?\d*)\/([a-zA-Z])$/)

  if ((leftFrac && rightFracWithVar && rightFracWithVar[2] === variable) ||
      (rightFrac && leftFracWithVar && leftFracWithVar[2] === variable)) {
    return solveProportion(left, right, variable)
  }

  return trySolveFor(left, right, variable)
}

function solveProportion(left: string, right: string, variable: string): string {
  try {
    // Parse both sides as fractions
    const leftParts = left.split('/')
    const rightParts = right.split('/')
    
    let leftNum: number, leftDenom: number, rightNum: number, rightDenom: number
    
    if (leftParts.length === 2) {
      leftNum = parseFraction(leftParts[0]) ?? NaN
      leftDenom = parseFraction(leftParts[1]) ?? NaN
    } else {
      leftNum = parseFraction(left) ?? NaN
      leftDenom = 1
    }
    
    if (rightParts.length === 2) {
      rightNum = parseFraction(rightParts[0]) ?? NaN
      rightDenom = parseFraction(rightParts[1]) ?? NaN
    } else {
      rightNum = parseFraction(right) ?? NaN
      rightDenom = 1
    }
    
    if (isNaN(leftNum) || isNaN(leftDenom) || isNaN(rightNum) || isNaN(rightDenom)) {
      return 'Error parsing equation'
    }
    
    // Cross-multiply: leftNum/leftDenom = rightNum/rightDenom
    // leftNum * rightDenom = rightNum * leftDenom
    
    // Determine which side has the variable
    const leftHasVar = left.includes(variable)
    const rightHasVar = right.includes(variable)
    
    let solution: number
    
    if (leftHasVar && !rightHasVar) {
      // Variable is on left side
      // If variable is in numerator: leftNum * rightDenom = rightNum * leftDenom
      // If variable is in denominator: leftNum * rightDenom = rightNum * leftDenom
      // We need to check where the variable is
      if (leftParts.length === 2 && leftParts[1].includes(variable)) {
        // Variable in denominator: a/x = b/c  =>  a*c = b*x  =>  x = (a*c)/b
        solution = (leftNum * rightDenom) / rightNum
      } else {
        // Variable in numerator or whole expression
        solution = (rightNum * leftDenom) / rightDenom
      }
    } else if (rightHasVar && !leftHasVar) {
      // Variable is on right side
      if (rightParts.length === 2 && rightParts[1].includes(variable)) {
        // Variable in denominator: a/b = c/x  =>  a*x = b*c  =>  x = (b*c)/a
        solution = (leftDenom * rightNum) / leftNum
      } else {
        // Variable in numerator or whole expression
        solution = (leftNum * rightDenom) / leftDenom
      }
    } else {
      return 'Error: Variable on both sides not supported for proportions'
    }
    
    return `${variable} = ${cleanFloat(solution)}`
  } catch (e) {
    return 'Error solving proportion'
  }
}

// Strips IEEE-754 float dust (e.g. 3.4999999999999996) left over from chained division
function cleanFloat(n: number): number {
  return Number.isFinite(n) ? Number(n.toPrecision(12)) : n
}

function parseFraction(value: string): number | null {
  if (value.includes('/')) {
    const [num, denom] = value.split('/').map(Number)
    if (isNaN(num) || isNaN(denom) || denom === 0) return null
    return num / denom
  }
  if (value === '') return null
  const num = Number(value)
  return isNaN(num) ? null : num
}

// Coefficients are tracked per-letter (not just for the target variable) so that a term
// belonging to another symbol - e.g. the "t" in "2x + 3t - 3t = 10" - can still cancel out
// instead of aborting the whole parse the moment a non-target letter shows up.
interface LinearExpr {
  coeffs: Record<string, number>
  constant: number
}

function trySolveFor(left: string, right: string, variable: string): string {
  try {
    const leftVal = parseExpression(left)
    const rightVal = parseExpression(right)

    if (leftVal === null || rightVal === null) return 'Error parsing equation'

    const letters = new Set([...Object.keys(leftVal.coeffs), ...Object.keys(rightVal.coeffs)])
    const constant = leftVal.constant - rightVal.constant

    for (const letter of letters) {
      if (letter === variable) continue
      const coeff = (leftVal.coeffs[letter] ?? 0) - (rightVal.coeffs[letter] ?? 0)
      if (Math.abs(coeff) > 1e-9) {
        return `Can't isolate "${variable}" - equation still depends on "${letter}"`
      }
    }

    const varCoeff = (leftVal.coeffs[variable] ?? 0) - (rightVal.coeffs[variable] ?? 0)

    if (Math.abs(varCoeff) < 1e-9) {
      return constant === 0 ? 'Infinite solutions' : 'No solution'
    }

    const solution = -constant / varCoeff
    return `${variable} = ${cleanFloat(solution)}`
  } catch (e) {
    return 'Error parsing equation'
  }
}

function parseExpression(expr: string): LinearExpr | null {
  return evaluateTokens(tokenize(expr))
}

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

  return tokens.filter(t => t && t !== '+' && t !== '-').map(t => {
    if (!t.startsWith('+') && !t.startsWith('-')) return '+' + t
    return t
  })
}

function evaluateTokens(tokens: string[]): LinearExpr | null {
  const coeffs: Record<string, number> = {}
  let constant = 0

  for (const token of tokens) {
    const sign = token[0] === '-' ? -1 : 1
    const term = token.slice(1)
    if (!term) return null

    if (term.includes('*') || term.includes('/')) {
      // A fraction with a letter in the denominator, e.g. "1426/p", isn't linear - unsupported
      if (/^(\d+\.?\d*)\/([a-zA-Z])$/.test(term)) return null

      const result = evaluateTerm(term)
      if (result === null) return null

      for (const [letter, coeff] of Object.entries(result.coeffs)) {
        coeffs[letter] = (coeffs[letter] ?? 0) + sign * coeff
      }
      constant += sign * result.constant
    } else if (/^[a-zA-Z]$/.test(term)) {
      coeffs[term] = (coeffs[term] ?? 0) + sign
    } else {
      const fracValue = parseFraction(term)
      if (fracValue !== null) {
        constant += sign * fracValue
      } else {
        // Handle coefficient with variable like "9t" or "2/3t"
        const fracVarMatch = term.match(/^(\d+\.?\d*\/\d+\.?\d*)([a-zA-Z])$/)
        const decimalMatch = term.match(/^(\d+\.?\d*)([a-zA-Z])$/)
        const match = fracVarMatch ?? decimalMatch
        if (match) {
          const coeff = parseFraction(match[1])
          if (coeff === null) return null
          coeffs[match[2]] = (coeffs[match[2]] ?? 0) + sign * coeff
        } else {
          return null
        }
      }
    }
  }

  return { coeffs, constant }
}

function evaluateTerm(term: string): LinearExpr | null {
  // A bare fraction coefficient optionally attached to a letter, e.g. "2/3a" or "3/4".
  // Here "2/3a" means (2/3)*a, not 2/(3a), so this must be checked before the left-to-right
  // */÷ chain below (which would otherwise treat "3a" as the number 3 and drop the letter).
  const simpleFracMatch = term.match(/^(\d+\.?\d*)\/(\d+\.?\d*)([a-zA-Z]?)$/)
  if (simpleFracMatch) {
    const [, numStr, denomStr, v] = simpleFracMatch
    const num = Number(numStr)
    const denom = Number(denomStr)
    if (isNaN(num) || isNaN(denom) || denom === 0) return null
    const coeff = num / denom
    return v ? { coeffs: { [v]: coeff }, constant: 0 } : { coeffs: {}, constant: coeff }
  }

  let value = 1
  let letter: string | null = null

  // Split by * and /
  const parts = term.split(/([*\/])/)
  let op = '*'

  for (const part of parts) {
    if (part === '*' || part === '/') {
      op = part
      continue
    }

    if (/^[a-zA-Z]$/.test(part)) {
      if (op === '/') return null // division by a letter - not supported
      if (letter !== null && letter !== part) return null // two different letters multiplied - not linear
      letter = part
      continue
    }

    const coeffVarMatch = part.match(/^(\d+\.?\d*)([a-zA-Z])$/)
    if (coeffVarMatch) {
      if (op !== '*') return null // division by a variable term - not supported
      const coeff = parseFraction(coeffVarMatch[1])
      if (coeff === null) return null
      if (letter !== null && letter !== coeffVarMatch[2]) return null
      value *= coeff
      letter = coeffVarMatch[2]
      continue
    }
    const num = parseFraction(part)
    if (num === null) return null
    value = op === '*' ? value * num : value / num
  }

  return letter ? { coeffs: { [letter]: value }, constant: 0 } : { coeffs: {}, constant: value }
}
