// A small general-purpose expression parser/evaluator (+, -, *, /, ^, parens, common functions)
// so this tool can handle "whatever" equation someone types, not just a hand-coded shape.

const FUNCTIONS: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt,
  abs: Math.abs,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  log: Math.log10,
  ln: Math.log,
  exp: Math.exp,
}

type Token =
  | { type: "num"; value: number }
  | { type: "ident"; value: string }
  | { type: "op"; value: string }
  | { type: "lparen" }
  | { type: "rparen" }

function preprocess(expr: string): string {
  return expr
    .replace(/\s+/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    // implicit multiplication: "2y" -> "2*y", "2(" -> "2*(", ")(" -> ")*(", ")2" -> ")*2", ")y" -> ")*y"
    .replace(/(\d)([a-zA-Z])/g, "$1*$2")
    .replace(/(\d|\))\(/g, "$1*(")
    .replace(/\)(\d|[a-zA-Z])/g, ")*$1")
}

function tokenize(expr: string): Token[] {
  const cleaned = preprocess(expr)
  const tokens: Token[] = []
  let i = 0

  while (i < cleaned.length) {
    const char = cleaned[i]
    if (/\d|\./.test(char)) {
      let j = i
      while (j < cleaned.length && /[\d.]/.test(cleaned[j])) j++
      tokens.push({ type: "num", value: Number(cleaned.slice(i, j)) })
      i = j
    } else if (/[a-zA-Z]/.test(char)) {
      let j = i
      while (j < cleaned.length && /[a-zA-Z0-9]/.test(cleaned[j])) j++
      tokens.push({ type: "ident", value: cleaned.slice(i, j) })
      i = j
    } else if (char === "(") {
      tokens.push({ type: "lparen" })
      i++
    } else if (char === ")") {
      tokens.push({ type: "rparen" })
      i++
    } else if ("+-*/^".includes(char)) {
      tokens.push({ type: "op", value: char })
      i++
    } else {
      throw new Error(`Unexpected character "${char}"`)
    }
  }
  return tokens
}

class Parser {
  tokens: Token[]
  pos = 0
  scope: Record<string, number>

  constructor(tokens: Token[], scope: Record<string, number>) {
    this.tokens = tokens
    this.scope = scope
  }

  peek(): Token | null {
    return this.tokens[this.pos] ?? null
  }

  next(): Token | null {
    return this.tokens[this.pos++] ?? null
  }

  parseExpr(): number {
    let left = this.parseTerm()
    while (true) {
      const tok = this.peek()
      if (tok?.type === "op" && (tok.value === "+" || tok.value === "-")) {
        this.next()
        const right = this.parseTerm()
        left = tok.value === "+" ? left + right : left - right
      } else break
    }
    return left
  }

  parseTerm(): number {
    let left = this.parsePower()
    while (true) {
      const tok = this.peek()
      if (tok?.type === "op" && (tok.value === "*" || tok.value === "/")) {
        this.next()
        const right = this.parsePower()
        left = tok.value === "*" ? left * right : left / right
      } else break
    }
    return left
  }

  parsePower(): number {
    const base = this.parseUnary()
    const tok = this.peek()
    if (tok?.type === "op" && tok.value === "^") {
      this.next()
      const exponent = this.parsePower() // right-associative
      return Math.pow(base, exponent)
    }
    return base
  }

  parseUnary(): number {
    const tok = this.peek()
    if (tok?.type === "op" && tok.value === "-") {
      this.next()
      return -this.parseUnary()
    }
    if (tok?.type === "op" && tok.value === "+") {
      this.next()
      return this.parseUnary()
    }
    return this.parsePrimary()
  }

  parsePrimary(): number {
    const tok = this.next()
    if (!tok) throw new Error("Unexpected end of expression")

    if (tok.type === "num") return tok.value

    if (tok.type === "lparen") {
      const value = this.parseExpr()
      const closing = this.next()
      if (closing?.type !== "rparen") throw new Error('Expected ")"')
      return value
    }

    if (tok.type === "ident") {
      const nextTok = this.peek()
      if (nextTok?.type === "lparen" && FUNCTIONS[tok.value]) {
        this.next()
        const arg = this.parseExpr()
        const closing = this.next()
        if (closing?.type !== "rparen") throw new Error('Expected ")"')
        return FUNCTIONS[tok.value](arg)
      }
      if (!(tok.value in this.scope)) throw new Error(`Missing value for "${tok.value}"`)
      const value = this.scope[tok.value]
      // implicit multiplication of a variable directly against a parenthesized group, e.g. "y(2+3)"
      if (this.peek()?.type === "lparen") {
        this.next()
        const rest = this.parseExpr()
        const closing = this.next()
        if (closing?.type !== "rparen") throw new Error('Expected ")"')
        return value * rest
      }
      return value
    }

    throw new Error("Could not parse expression")
  }
}

export function evaluateExpression(expr: string, scope: Record<string, number>): number {
  const parser = new Parser(tokenize(expr), scope)
  const value = parser.parseExpr()
  if (parser.pos !== parser.tokens.length) throw new Error("Could not parse the full expression")
  return value
}

// Lists every variable name used in an equation (excluding known function names), so the UI
// can render an input for each one, e.g. "x = y^2 - 4" -> ["x", "y"]
export function extractFunctionVariables(equation: string): string[] {
  const tokens = tokenize(equation.replace("=", "+0*"))
  const names: string[] = []
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i]
    if (tok.type !== "ident") continue
    const isFunctionCall = tok.value in FUNCTIONS && tokens[i + 1]?.type === "lparen"
    if (!isFunctionCall && !names.includes(tok.value)) names.push(tok.value)
  }
  return names
}

function cleanFloat(n: number): number {
  if (!Number.isFinite(n)) return n
  const rounded = Number(n.toPrecision(10))
  return rounded === 0 ? 0 : rounded
}

export interface FunctionSolveResult {
  values: number[]
}

// Solves "lhs = rhs" for `unknownVar`, given numeric values for every other variable, by
// scanning for sign changes in (lhs - rhs) and bisecting each bracket - this works for any
// equation the parser above can evaluate, not just linear ones, and can surface multiple roots.
export function solveFunctionEquation(
  equation: string,
  knownValues: Record<string, number>,
  unknownVar: string
): FunctionSolveResult | { error: string } {
  const parts = equation.split("=")
  if (parts.length !== 2) return { error: 'Enter an equation with one "=", e.g. x = y^2 - 4' }
  const [lhs, rhs] = parts

  function f(x: number): number | null {
    try {
      const scope = { ...knownValues, [unknownVar]: x }
      const value = evaluateExpression(lhs, scope) - evaluateExpression(rhs, scope)
      return Number.isFinite(value) ? value : null
    } catch {
      return null
    }
  }

  const RANGE = 1000
  const STEP = 0.25
  const roots: number[] = []

  let prevX = -RANGE
  let prevY = f(prevX)

  for (let x = -RANGE + STEP; x <= RANGE; x += STEP) {
    const y = f(x)
    if (prevY !== null && y !== null) {
      if (prevY === 0) {
        roots.push(prevX)
      } else if (prevY * y < 0) {
        // bisect within (prevX, x)
        let lo = prevX, hi = x
        let loVal = prevY
        for (let i = 0; i < 60; i++) {
          const mid = (lo + hi) / 2
          const midVal = f(mid)
          if (midVal === null) break
          if (midVal === 0) { lo = hi = mid; break }
          if (loVal * midVal < 0) { hi = mid } else { lo = mid; loVal = midVal }
        }
        roots.push((lo + hi) / 2)
      } else if (y === 0) {
        roots.push(x)
      }
    }
    prevX = x
    prevY = y
  }

  const cleaned = roots.map(cleanFloat)
  const unique: number[] = []
  for (const r of cleaned) {
    if (!unique.some(u => Math.abs(u - r) < 1e-6)) unique.push(r)
  }

  if (unique.length === 0) return { error: `No solution found for "${unknownVar}" in the range -${RANGE} to ${RANGE}` }

  unique.sort((a, b) => a - b)
  return { values: unique.slice(0, 10) }
}
