export function solveEquation(equation: string): string {
  const cleaned = equation.replace(/\s+/g, '').replace(/\*/g, '*').replace(/×/g, '*')
    .replace(/([a-zA-Z0-9.]+)%/g, '0.01*$1')
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
  if (variables.size > 1) {
    const varArray = Array.from(variables)
    // Try each variable
    for (const v of varArray) {
      const result = trySolveFor(left, right, v, varArray)
      if (!result.startsWith('Error')) return result
    }
    return `Multiple variables detected: ${varArray.join(', ')}. Specify one to solve for.`
  }

  const variable = Array.from(variables)[0]
  
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
  
  return trySolveFor(left, right, variable, [variable])
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
    
    return `${variable} = ${solution}`
  } catch (e) {
    return 'Error solving proportion'
  }
}

function parseFraction(value: string): number | null {
  if (value.includes('/')) {
    const [num, denom] = value.split('/').map(Number)
    if (isNaN(num) || isNaN(denom) || denom === 0) return null
    return num / denom
  }
  const num = parseFloat(value)
  return isNaN(num) ? null : num
}

function trySolveFor(left: string, right: string, variable: string, allVars: string[]): string {
  try {
    const leftVal = parseExpression(left, variable, allVars)
    const rightVal = parseExpression(right, variable, allVars)

    if (leftVal === null || rightVal === null) return 'Error parsing equation'

    const varCoeff = leftVal.varCoeff - rightVal.varCoeff
    const constant = leftVal.constant - rightVal.constant

    if (varCoeff === 0) {
      return constant === 0 ? 'Infinite solutions' : 'No solution'
    }

    const solution = -constant / varCoeff
    return `${variable} = ${solution}`
  } catch (e) {
    return 'Error parsing equation'
  }
}

function parseExpression(expr: string, variable: string, allVars: string[]): { varCoeff: number; constant: number } | null {
  const tokens = tokenize(expr, variable, allVars)
  return evaluateTokens(tokens, variable)
}

function tokenize(expr: string, variable: string, allVars: string[]): string[] {
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

function evaluateTokens(tokens: string[], variable: string): { varCoeff: number; constant: number } | null {
  let varCoeff = 0
  let constant = 0

  for (const token of tokens) {
    const sign = token[0] === '-' ? -1 : 1
    const term = token.slice(1)

    if (term.includes('*') || term.includes('/')) {
      // Check if this is a fraction with variable in denominator (e.g., "1426/p")
      const fracMatch = term.match(/^(\d+\.?\d*)\/([a-zA-Z])$/)
      if (fracMatch && fracMatch[2] === variable) {
        // This is like "1426/p" which equals 1426 * (1/p)
        // For linear equations, we need to handle this as a coefficient
        // But this makes it non-linear. Let's cross-multiply approach instead.
        // Actually, we can treat this as: term = 1426/p
        // When we have a = b/p, we can rewrite as ap = b
        // So 1426/p contributes to the equation differently
        // For now, let's return null for this case as it's not a standard linear form
        return null
      }
      
      const result = evaluateTerm(term, variable)
      if (result === null) return null
      
      varCoeff += sign * result.varCoeff
      constant += sign * result.constant
    } else if (term === variable) {
      varCoeff += sign
    } else {
      // Try to parse as fraction first
      const fracValue = parseFraction(term)
      if (fracValue !== null) {
        constant += sign * fracValue
      } else {
        // Handle coefficient with variable like "9t"
        const match = term.match(/^(\d+\.?\d*\/\d+\.?\d*)([a-zA-Z])$/)
        if (match && match[2] === variable) {
          const coeff = parseFraction(match[1])
          if (coeff !== null) {
            varCoeff += sign * coeff
          } else {
            return null
          }
        } else {
          const decimalMatch = term.match(/^(\d+\.?\d*)([a-zA-Z])$/)
          if (decimalMatch && decimalMatch[2] === variable) {
            varCoeff += sign * parseFloat(decimalMatch[1])
          } else {
            return null
          }
        }
      }
    }
  }

  return { varCoeff, constant }
}

function evaluateTerm(term: string, variable: string): { varCoeff: number; constant: number } | null {
  let hasVar = term.includes(variable)
  let value = 1
  let isVar = false

  // Split by * and /
  const parts = term.split(/([*\/])/)
  let op = '*'

  for (const part of parts) {
    if (part === '*' || part === '/') {
      op = part
      continue
    }

    if (part === variable) {
      if (op === '*') isVar = true
      else if (op === '/') {
        // Division by variable - not supported for linear equations
        return null
      }
    } else {
      const num = parseFraction(part)
      if (num === null) return null
      value = op === '*' ? value * num : value / num
    }
  }

  return isVar ? { varCoeff: value, constant: 0 } : { varCoeff: 0, constant: value }
}
