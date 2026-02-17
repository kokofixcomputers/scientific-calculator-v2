export function solveEquation(equation: string): string {
  const cleaned = equation.replace(/\s+/g, '').replace(/\*/g, '*').replace(/×/g, '*')
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
  return trySolveFor(left, right, variable, [variable])
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
    
    if (char === '+' || char === '-') {
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
      const result = evaluateTerm(term, variable)
      if (result === null) return null
      
      varCoeff += sign * result.varCoeff
      constant += sign * result.constant
    } else if (term === variable) {
      varCoeff += sign
    } else if (term.match(/^\d+\.?\d*$/)) {
      constant += sign * parseFloat(term)
    } else {
      return null
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
      else return null // Can't divide by variable
    } else {
      const num = parseFloat(part)
      if (isNaN(num)) return null
      value = op === '*' ? value * num : value / num
    }
  }

  return isVar ? { varCoeff: value, constant: 0 } : { varCoeff: 0, constant: value }
}
