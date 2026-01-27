export type Operator = "+" | "-" | "*" | "/" | "^"

export interface CalcState {
  expression: string
  current: string
  previous: string
  showFraction: boolean
}

export function createInitialState(): CalcState {
  return { expression: "", current: "0", previous: "", showFraction: false }
}

export function inputDigit(state: CalcState, digit: string): CalcState {
  return {
    ...state,
    current: state.current === "0" ? digit : state.current + digit,
  }
}

export function inputDecimal(state: CalcState): CalcState {
  if (state.current.includes(".")) return state
  return { ...state, current: state.current + "." }
}

export function inputFraction(state: CalcState): CalcState {
  if (state.current.includes("/")) return state
  return { ...state, current: state.current + "/" }
}

export function clear(): CalcState {
  return createInitialState()
}

export function setOperator(state: CalcState, op: Operator): CalcState {
  return {
    ...state,
    expression: state.expression + state.current + " " + op + " ",
    current: "0",
  }
}

export function inputParenthesis(state: CalcState, paren: string): CalcState {
  return { ...state, current: state.current === "0" ? paren : state.current + paren }
}

function evaluateExpression(expr: string): number {
  // Handle fractions in expression
  let processedExpr = expr.replace(/\b(\d+)\/(\d+)\b/g, '($1/$2)')
  
  // Handle implicit multiplication: 3(4) -> 3*(4), (2)(3) -> (2)*(3), 2(3+4) -> 2*(3+4)
  processedExpr = processedExpr.replace(/(\d)\(/g, '$1*(')
  processedExpr = processedExpr.replace(/\)(\d)/g, ')*$1')
  processedExpr = processedExpr.replace(/\)\(/g, ')*(')
  
  try {
    // Use Function constructor for safe evaluation with order of operations
    return Function('"use strict"; return (' + processedExpr.replace(/\^/g, '**') + ')')();
  } catch {
    return NaN
  }
}

function decimalToFraction(decimal: number): string {
  if (Number.isInteger(decimal)) return decimal.toString()
  
  const tolerance = 1.0E-6
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1
  let b = decimal
  
  do {
    const a = Math.floor(b)
    let aux = h1
    h1 = a * h1 + h2
    h2 = aux
    aux = k1
    k1 = a * k1 + k2
    k2 = aux
    b = 1 / (b - a)
  } while (Math.abs(decimal - h1 / k1) > decimal * tolerance)
  
  return `${h1}/${k1}`
}

export function calculate(state: CalcState): CalcState {
  // If there's an expression, use it + current
  let fullExpression = ""
  if (state.expression) {
    fullExpression = state.expression + state.current
  } else {
    // If no expression but current contains operators/parentheses, use current as full expression
    fullExpression = state.current
  }
  
  // Only calculate if we have something to evaluate
  if (!fullExpression || fullExpression === "0") return state

  const result = evaluateExpression(fullExpression)
  
  if (isNaN(result)) {
    return { ...state, current: "Error", expression: "", previous: "" }
  }
  
  const resultStr = state.showFraction ? decimalToFraction(result) : String(result)
  
  return {
    expression: "",
    current: resultStr,
    previous: fullExpression + " =",
    showFraction: state.showFraction,
  }
}

export function toggleFractionMode(state: CalcState): CalcState {
  return { ...state, showFraction: !state.showFraction }
}

/* Scientific helpers */
export function sqrt(value: string): string {
  return String(Math.sqrt(Number(value)))
}

export function cbrt(value: string): string {
  return String(Math.cbrt(Number(value)))
}

export function square(value: string): string {
  return String(Math.pow(Number(value), 2))
}

export function backspace(state: CalcState): CalcState {
  // If current has content, remove last character
  if (state.current.length > 1) {
    return { ...state, current: state.current.slice(0, -1) }
  }
  
  // If current is "0" or single character, check if we can pull from expression
  if (state.expression) {
    const trimmed = state.expression.trim()
    
    // Find the last number/operand in the expression
    const parts = trimmed.split(' ')
    if (parts.length >= 3) {
      // Remove the last operand and operator, move operand to current
      const lastOperand = parts[parts.length - 3]
      const newExpression = parts.slice(0, -3).join(' ') + (parts.length > 3 ? ' ' : '')
      
      return {
        ...state,
        expression: newExpression,
        current: lastOperand,
        previous: ""
      }
    } else {
      // If only one operand in expression, move it to current and clear expression
      return {
        ...state,
        expression: "",
        current: parts[0] || "0",
        previous: ""
      }
    }
  }
  
  // If we have a previous calculation result, clear it
  if (state.previous) {
    return { ...state, previous: "" }
  }
  
  // Default: set current to "0"
  return { ...state, current: "0" }
}
