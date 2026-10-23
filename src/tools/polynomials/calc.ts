// A small symbolic engine: an expression is represented as a sum of terms, each term a
// coefficient times a product of variable powers (e.g. "3x^2y" -> {coeff:3, powers:{x:2,y:1}}).
// This lets the tool reason about *structure* (term count, degree, exponents) instead of
// just computing a numeric value.

import { primeFactorization } from "../math/calc"

export type Powers = Record<string, number>

export interface PolyTerm {
  coeff: number
  powers: Powers
}

export type PolyExpr = PolyTerm[]

const FUNCTIONS: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt, abs: Math.abs, sin: Math.sin, cos: Math.cos, tan: Math.tan,
  log: Math.log10, ln: Math.log, exp: Math.exp,
}

export class NotPolynomialError extends Error {}

function powersKey(powers: Powers): string {
  return Object.keys(powers).filter(k => powers[k] !== 0).sort().map(k => `${k}^${powers[k]}`).join(",")
}

function cleanPowers(powers: Powers): Powers {
  const out: Powers = {}
  for (const [k, v] of Object.entries(powers)) if (v !== 0) out[k] = v
  return out
}

function mergeTerms(terms: PolyTerm[]): PolyExpr {
  const map = new Map<string, PolyTerm>()
  for (const t of terms) {
    const powers = cleanPowers(t.powers)
    const key = powersKey(powers)
    const existing = map.get(key)
    if (existing) existing.coeff += t.coeff
    else map.set(key, { coeff: t.coeff, powers })
  }
  return Array.from(map.values()).filter(t => Math.abs(t.coeff) > 1e-9)
}

export function addPoly(a: PolyExpr, b: PolyExpr, sign: 1 | -1 = 1): PolyExpr {
  return mergeTerms([...a, ...b.map(t => ({ coeff: sign * t.coeff, powers: t.powers }))])
}

export function mulPoly(a: PolyExpr, b: PolyExpr): PolyExpr {
  const out: PolyTerm[] = []
  for (const ta of a) {
    for (const tb of b) {
      const powers: Powers = { ...ta.powers }
      for (const [k, v] of Object.entries(tb.powers)) powers[k] = (powers[k] ?? 0) + v
      out.push({ coeff: ta.coeff * tb.coeff, powers })
    }
  }
  return mergeTerms(out)
}

function powPoly(a: PolyExpr, n: number): PolyExpr {
  if (n > 40) throw new NotPolynomialError("Exponent is too large to expand")
  let result: PolyExpr = [{ coeff: 1, powers: {} }]
  for (let i = 0; i < n; i++) result = mulPoly(result, a)
  return result
}

function isConstantExpr(a: PolyExpr): boolean {
  return a.every(t => Object.keys(t.powers).length === 0)
}

function constantValue(a: PolyExpr): number {
  return a.reduce((sum, t) => sum + t.coeff, 0)
}

// --- Tokenizer (shared shape with the Function Calculator's) ---
type Token =
  | { type: "num"; value: number }
  | { type: "ident"; value: string }
  | { type: "op"; value: string }
  | { type: "lparen" } | { type: "rparen" }

function preprocess(expr: string): string {
  return expr
    .replace(/\s+/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
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
      // Greedily match a known function name (e.g. "sqrt(") at this position; otherwise
      // each letter is its own single-letter variable, so "mn" parses as "m * n", not a
      // single variable literally named "mn"
      let matched: string | null = null
      for (const name of Object.keys(FUNCTIONS)) {
        if (cleaned.startsWith(name, i) && cleaned[i + name.length] === "(") {
          if (!matched || name.length > matched.length) matched = name
        }
      }
      if (matched) {
        tokens.push({ type: "ident", value: matched })
        i += matched.length
      } else {
        tokens.push({ type: "ident", value: char })
        i++
      }
    } else if (char === "(") { tokens.push({ type: "lparen" }); i++ }
    else if (char === ")") { tokens.push({ type: "rparen" }); i++ }
    else if ("+-*/^".includes(char)) { tokens.push({ type: "op", value: char }); i++ }
    else throw new Error(`Unexpected character "${char}"`)
  }
  return tokens
}

class Parser {
  tokens: Token[]
  pos = 0
  constructor(tokens: Token[]) { this.tokens = tokens }
  peek(): Token | null { return this.tokens[this.pos] ?? null }
  next(): Token | null { return this.tokens[this.pos++] ?? null }

  parseExpr(): PolyExpr {
    let left = this.parseTerm()
    while (true) {
      const tok = this.peek()
      if (tok?.type === "op" && (tok.value === "+" || tok.value === "-")) {
        this.next()
        left = addPoly(left, this.parseTerm(), tok.value === "+" ? 1 : -1)
      } else break
    }
    return left
  }

  parseTerm(): PolyExpr {
    let left = this.parsePower()
    while (true) {
      const tok = this.peek()
      if (tok?.type === "op" && (tok.value === "*" || tok.value === "/")) {
        this.next()
        const right = this.parsePower()
        if (tok.value === "*") {
          left = mulPoly(left, right)
        } else {
          if (!isConstantExpr(right)) throw new NotPolynomialError("Division by an expression containing a variable")
          const divisor = constantValue(right)
          if (divisor === 0) throw new NotPolynomialError("Division by zero")
          left = left.map(t => ({ coeff: t.coeff / divisor, powers: t.powers }))
        }
      } else if (tok && tok.type !== "op" && tok.type !== "rparen") {
        // Implicit multiplication between adjacent factors with no operator, e.g. "mn" -> m*n,
        // "x(x+1)" -> x*(x+1)
        left = mulPoly(left, this.parsePower())
      } else break
    }
    return left
  }

  parsePower(): PolyExpr {
    const base = this.parseUnary()
    const tok = this.peek()
    if (tok?.type === "op" && tok.value === "^") {
      this.next()
      const exponentExpr = this.parseUnary()
      if (!isConstantExpr(exponentExpr)) throw new NotPolynomialError("A variable in an exponent (e.g. 2^x) is not a polynomial")
      const exponent = constantValue(exponentExpr)

      if (isConstantExpr(base)) {
        return [{ coeff: Math.pow(constantValue(base), exponent), powers: {} }]
      }
      if (!Number.isInteger(exponent) || exponent < 0) {
        throw new NotPolynomialError(
          exponent < 0
            ? "A negative exponent on a variable (e.g. x^-1) is not a polynomial"
            : "A fractional exponent on a variable (a radical, e.g. x^(1/2)) is not a polynomial"
        )
      }
      return powPoly(base, exponent)
    }
    return base
  }

  parseUnary(): PolyExpr {
    const tok = this.peek()
    if (tok?.type === "op" && tok.value === "-") { this.next(); return this.parseUnary().map(t => ({ coeff: -t.coeff, powers: t.powers })) }
    if (tok?.type === "op" && tok.value === "+") { this.next(); return this.parseUnary() }
    return this.parsePrimary()
  }

  parsePrimary(): PolyExpr {
    const tok = this.next()
    if (!tok) throw new Error("Unexpected end of expression")

    if (tok.type === "num") return [{ coeff: tok.value, powers: {} }]

    if (tok.type === "lparen") {
      const value = this.parseExpr()
      if (this.next()?.type !== "rparen") throw new Error('Expected ")"')
      return value
    }

    if (tok.type === "ident") {
      const nextTok = this.peek()
      if (nextTok?.type === "lparen" && FUNCTIONS[tok.value]) {
        this.next()
        const arg = this.parseExpr()
        if (this.next()?.type !== "rparen") throw new Error('Expected ")"')
        if (!isConstantExpr(arg)) throw new NotPolynomialError(`"${tok.value}(...)" applied to a variable is not a polynomial term`)
        return [{ coeff: FUNCTIONS[tok.value](constantValue(arg)), powers: {} }]
      }
      // A variable directly against "(" (e.g. "x(x+1)") or another identifier (e.g. "mn")
      // is handled by parseTerm's implicit-multiplication check, not here
      return [{ coeff: 1, powers: { [tok.value]: 1 } }]
    }

    throw new Error("Could not parse expression")
  }
}

export function parsePolynomial(expr: string): PolyExpr {
  if (!expr.trim()) throw new Error("Enter an expression")
  const parser = new Parser(tokenize(expr))
  const result = parser.parseExpr()
  if (parser.pos !== parser.tokens.length) throw new Error("Could not parse the full expression")
  return result
}

function termDegree(t: PolyTerm): number {
  return Object.values(t.powers).reduce((s, e) => s + e, 0)
}

export function degreeOf(expr: PolyExpr): number {
  if (expr.length === 0) return 0
  return Math.max(...expr.map(termDegree))
}

export function variablesOf(expr: PolyExpr): string[] {
  const vars = new Set<string>()
  for (const t of expr) for (const v of Object.keys(t.powers)) vars.add(v)
  return Array.from(vars).sort()
}

export function termCountName(count: number): string {
  if (count === 0) return "Zero polynomial"
  if (count === 1) return "Monomial"
  if (count === 2) return "Binomial"
  if (count === 3) return "Trinomial"
  return `Polynomial (${count} terms)`
}

export function degreeName(degree: number, isZero: boolean): string {
  if (isZero) return "Undefined (zero polynomial)"
  const names = ["Constant", "Linear", "Quadratic", "Cubic", "Quartic", "Quintic", "Sextic", "Septic", "Octic"]
  return names[degree] ?? `Degree ${degree}`
}

function formatCoeff(n: number): string {
  const rounded = Number(n.toPrecision(10))
  return String(rounded)
}

function formatVariablePart(powers: Powers): string {
  return Object.keys(powers).sort()
    .map(v => (powers[v] === 1 ? v : `${v}^${powers[v]}`))
    .join("")
}

export function formatPolynomial(expr: PolyExpr): string {
  if (expr.length === 0) return "0"

  const sorted = [...expr].sort((a, b) => {
    const degDiff = termDegree(b) - termDegree(a)
    if (degDiff !== 0) return degDiff
    return powersKey(a.powers).localeCompare(powersKey(b.powers))
  })

  const parts = sorted.map(t => {
    const varPart = formatVariablePart(t.powers)
    if (!varPart) return { sign: t.coeff < 0 ? "-" : "+", body: formatCoeff(Math.abs(t.coeff)) }
    const absCoeff = Math.abs(t.coeff)
    const coeffPart = absCoeff === 1 ? "" : formatCoeff(absCoeff)
    return { sign: t.coeff < 0 ? "-" : "+", body: `${coeffPart}${varPart}` }
  })

  return parts.map((p, i) => (i === 0 ? (p.sign === "-" ? "-" : "") + p.body : ` ${p.sign} ${p.body}`)).join("")
}

// Expands a single term into repeated multiplication, e.g. "8x^2" -> "2*2*2*x*x"
// (the coefficient is broken into its prime factors, each variable repeated per its exponent)
function expandTerm(t: PolyTerm): string {
  const absCoeff = Math.abs(t.coeff)
  const factors: string[] = []

  if (Number.isInteger(absCoeff) && absCoeff > 1) {
    factors.push(...primeFactorization(absCoeff).map(String))
  } else if (absCoeff !== 1) {
    factors.push(formatCoeff(absCoeff)) // non-integer coefficient (e.g. from "x/2") - can't be prime-factored
  }

  for (const v of Object.keys(t.powers).sort()) {
    for (let i = 0; i < t.powers[v]; i++) factors.push(v)
  }

  if (factors.length === 0) factors.push("1") // e.g. the term was exactly "1" or "-1"
  return (t.coeff < 0 ? "-" : "") + factors.join("*")
}

// Expands every term of a polynomial into repeated multiplication and joins them back
// together, e.g. "8x^2 + 3x" -> "2*2*2*x*x + 3*x"
export function expandToFactors(exprString: string): { expanded: string } | { error: string } {
  let expr: PolyExpr
  try { expr = parsePolynomial(exprString) } catch (e) { return { error: e instanceof Error ? e.message : "Could not parse the expression" } }

  expr = expr.filter(t => Math.abs(t.coeff) > 1e-9)
  if (expr.length === 0) return { expanded: "0" }

  const sorted = [...expr].sort((a, b) => {
    const degDiff = termDegree(b) - termDegree(a)
    if (degDiff !== 0) return degDiff
    return powersKey(a.powers).localeCompare(powersKey(b.powers))
  })

  const parts = sorted.map(t => ({ sign: t.coeff < 0 ? "-" : "+", body: expandTerm({ ...t, coeff: Math.abs(t.coeff) }) }))
  return { expanded: parts.map((p, i) => (i === 0 ? (p.sign === "-" ? "-" : "") + p.body : ` ${p.sign} ${p.body}`)).join("") }
}

function powersEqual(a: Powers, b: Powers): boolean {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  return keysA.every(k => a[k] === b[k])
}

export interface LikeTermsResult {
  isLike: boolean
  termA: string
  termB: string
  reason: string
}

// "-x^3" and "x^3" -> like terms (same variable part, x^3; only the coefficient differs)
export function compareLikeTerms(exprA: string, exprB: string): LikeTermsResult | { error: string } {
  let a: PolyExpr, b: PolyExpr
  try { a = parsePolynomial(exprA) } catch (e) { return { error: `First term: ${e instanceof Error ? e.message : "could not parse"}` } }
  try { b = parsePolynomial(exprB) } catch (e) { return { error: `Second term: ${e instanceof Error ? e.message : "could not parse"}` } }

  if (a.length > 1) return { error: "First input has more than one term - enter a single term" }
  if (b.length > 1) return { error: "Second input has more than one term - enter a single term" }

  const powersA = a.length === 0 ? {} : a[0].powers
  const powersB = b.length === 0 ? {} : b[0].powers
  const isLike = powersEqual(powersA, powersB)
  const varPart = formatVariablePart(powersA)

  return {
    isLike,
    termA: formatPolynomial(a),
    termB: formatPolynomial(b),
    reason: isLike
      ? `Yes - both have the same variable part${varPart ? ` (${varPart})` : " (both constants)"}, only the coefficient differs`
      : `No - the variable parts differ (${varPart || "constant"} vs ${formatVariablePart(powersB) || "constant"})`,
  }
}

function gcdInt(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b)
  while (b > 1e-9) { [a, b] = [b, a % b] }
  return a
}

// Converts a PolyExpr into a coefficient array (index = power of `variable`) if every term
// is either a constant or a pure power of that one variable - returns null otherwise
// (i.e. the expression involves some other variable and can't be treated as single-variable).
function toCoeffArray(expr: PolyExpr, variable: string): number[] | null {
  let maxDeg = 0
  for (const t of expr) {
    const keys = Object.keys(t.powers)
    if (keys.length === 0) continue
    if (keys.length > 1 || keys[0] !== variable) return null
    maxDeg = Math.max(maxDeg, t.powers[variable])
  }
  const arr = new Array(maxDeg + 1).fill(0)
  for (const t of expr) {
    const keys = Object.keys(t.powers)
    const deg = keys.length === 0 ? 0 : t.powers[variable]
    arr[deg] += t.coeff
  }
  return arr
}

function coeffArrayToPoly(arr: number[], variable: string): PolyExpr {
  const terms: PolyTerm[] = []
  for (let deg = 0; deg < arr.length; deg++) {
    if (Math.abs(arr[deg]) > 1e-9) terms.push({ coeff: arr[deg], powers: deg === 0 ? {} : { [variable]: deg } })
  }
  return terms
}

function isZeroArray(arr: number[]): boolean {
  return arr.every(c => Math.abs(c) < 1e-9)
}

// Standard long division of single-variable polynomials, e.g. (x^2-1) / (x-1) -> quotient x+1, remainder 0
function polyLongDivide(numArr: number[], denArr: number[]): { quotient: number[]; remainder: number[] } {
  const remainder = [...numArr]
  const denDeg = denArr.length - 1
  const denLead = denArr[denDeg]
  const quotient = new Array(Math.max(0, numArr.length - denArr.length + 1)).fill(0)

  for (let deg = remainder.length - 1; deg >= denDeg; deg--) {
    if (Math.abs(remainder[deg]) < 1e-9) continue
    const coeff = remainder[deg] / denLead
    const qDeg = deg - denDeg
    quotient[qDeg] = coeff
    for (let i = 0; i <= denDeg; i++) remainder[deg - denDeg + i] -= coeff * denArr[i]
  }
  return { quotient, remainder }
}

function formatFraction(num: PolyExpr, den: PolyExpr): string {
  const numStr = formatPolynomial(num)
  if (den.length === 1 && den[0].coeff === 1 && Object.keys(den[0].powers).length === 0) return numStr
  const denStr = formatPolynomial(den)
  const wrappedNum = num.length > 1 ? `(${numStr})` : numStr
  const wrappedDen = den.length > 1 ? `(${denStr})` : denStr
  return `${wrappedNum} / ${wrappedDen}`
}

export interface RationalResult {
  simplified: string
}

// Simplifies a rational expression like "18m^2n / 6mn" -> "3m", or "(x^2-1) / (x-1)" -> "x + 1"
export function simplifyRational(numeratorExpr: string, denominatorExpr: string): RationalResult | { error: string } {
  let num: PolyExpr, den: PolyExpr
  try { num = parsePolynomial(numeratorExpr) } catch (e) { return { error: `Numerator: ${e instanceof Error ? e.message : "could not parse"}` } }
  try { den = parsePolynomial(denominatorExpr) } catch (e) { return { error: `Denominator: ${e instanceof Error ? e.message : "could not parse"}` } }

  // A bare "0" parses to a single zero-coefficient term, not an empty array - drop it so
  // the zero checks below are reliable regardless of how the zero was written
  num = num.filter(t => Math.abs(t.coeff) > 1e-9)
  den = den.filter(t => Math.abs(t.coeff) > 1e-9)

  if (den.length === 0) return { error: "Division by zero" }
  if (num.length === 0) return { simplified: "0" }

  const allVars = new Set([...variablesOf(num), ...variablesOf(den)])

  // Single-variable case: try exact polynomial long division first (handles e.g. (x^2-1)/(x-1) -> x+1)
  if (allVars.size <= 1) {
    const variable = allVars.size === 1 ? Array.from(allVars)[0] : "x"
    const numArr = toCoeffArray(num, variable)
    const denArr = toCoeffArray(den, variable)
    if (numArr && denArr) {
      const { quotient, remainder } = polyLongDivide(numArr, denArr)
      if (isZeroArray(remainder)) {
        return { simplified: formatPolynomial(coeffArrayToPoly(quotient, variable)) }
      }
    }
  }

  // General case: factor out the greatest common monomial shared by every term on both
  // sides (numeric GCD of all coefficients, and the minimum power of each variable across
  // every term of both numerator and denominator), then divide both sides by it.
  const gcm = extractGCM([...num, ...den])
  const simplifiedNum = divideByMonomial(num, gcm)
  const simplifiedDen = divideByMonomial(den, gcm)

  return { simplified: formatFraction(simplifiedNum, simplifiedDen) }
}

// Finds the greatest common monomial factor across a set of terms: the GCD of their
// (integer) coefficients, and for each variable, the smallest exponent it has across
// every term (0 if any term lacks that variable entirely).
function extractGCM(terms: PolyTerm[]): PolyTerm {
  let coeffGcd = 0
  for (const t of terms) coeffGcd = gcdInt(coeffGcd, t.coeff)
  if (coeffGcd === 0) coeffGcd = 1

  const vars = new Set<string>()
  for (const t of terms) for (const v of Object.keys(t.powers)) vars.add(v)

  const powers: Powers = {}
  for (const v of vars) {
    let minExp = Infinity
    for (const t of terms) minExp = Math.min(minExp, t.powers[v] ?? 0)
    if (minExp > 0) powers[v] = minExp
  }

  return { coeff: coeffGcd, powers }
}

function divideByMonomial(expr: PolyExpr, monomial: PolyTerm): PolyExpr {
  return expr.map(t => {
    const powers: Powers = { ...t.powers }
    for (const [v, e] of Object.entries(monomial.powers)) powers[v] = (powers[v] ?? 0) - e
    return { coeff: t.coeff / monomial.coeff, powers: cleanPowers(powers) }
  })
}

function isTrivialMonomial(m: PolyTerm): boolean {
  return Math.abs(m.coeff - 1) < 1e-9 && Object.keys(m.powers).length === 0
}

export interface GCFResult {
  gcf: string
  factoredForm: string
}

// Accepts one or more expressions - either the separate terms whose GCF you want
// (e.g. "2xy^2" and "x^2y" -> GCF "xy"), or a single polynomial to pull a GCF out of
// (e.g. "12x^3 + 18x^2 - 6x" -> GCF "6x", factored "6x(2x^2 + 3x - 1)"). Every term
// across every input is pooled before finding the greatest common monomial.
export function findGCF(exprStrings: string[]): GCFResult | { error: string } {
  const allTerms: PolyTerm[] = []
  for (const s of exprStrings) {
    if (!s.trim()) continue
    let p: PolyExpr
    try { p = parsePolynomial(s) } catch (e) { return { error: `"${s}": ${e instanceof Error ? e.message : "could not parse"}` } }
    allTerms.push(...p.filter(t => Math.abs(t.coeff) > 1e-9))
  }

  if (allTerms.length === 0) return { error: "Enter at least one term" }
  // A single term has nothing to factor out of it - "x" isn't usefully "x * 1"
  if (allTerms.length === 1) return { gcf: "1", factoredForm: formatPolynomial(allTerms) }

  // Find the GCF from the terms as entered - NOT pre-merged, since two separate inputs that
  // happen to share a variable part (e.g. "3x" and "2x") must stay independent here, or their
  // coefficients would wrongly combine into 5 before computing gcd(3, 2) = 1
  const gcm = extractGCM(allTerms)
  if (isTrivialMonomial(gcm)) return { gcf: "1", factoredForm: formatPolynomial(mergeTerms(allTerms)) }

  // Only merge for the *display* of what's left, after the GCF is already locked in
  const remaining = mergeTerms(divideByMonomial(allTerms, gcm))
  const gcfStr = formatPolynomial([gcm])
  const remainingStr = formatPolynomial(remaining)
  return { gcf: gcfStr, factoredForm: `${gcfStr}(${remainingStr})` }
}

// A perfect-square term is one whose coefficient is a perfect square and every exponent is
// even, e.g. "9x^4" -> "3x^2". Returns its square root as a term, or null if it doesn't qualify.
function perfectSquareRoot(t: PolyTerm): PolyTerm | null {
  if (t.coeff < 0) return null
  const sqrtCoeff = Math.sqrt(t.coeff)
  if (Math.abs(sqrtCoeff - Math.round(sqrtCoeff)) > 1e-9) return null
  const powers: Powers = {}
  for (const [v, e] of Object.entries(t.powers)) {
    if (e % 2 !== 0) return null
    powers[v] = e / 2
  }
  return { coeff: Math.round(sqrtCoeff), powers }
}

function termsEqual(a: PolyTerm, b: PolyTerm): boolean {
  return Math.abs(a.coeff - b.coeff) < 1e-9 && powersEqual(a.powers, b.powers)
}

// a^2 - b^2 -> (a-b)(a+b)
function tryDifferenceOfSquares(expr: PolyExpr): [PolyExpr, PolyExpr] | null {
  if (expr.length !== 2) return null
  const [t1, t2] = expr
  if (t1.coeff > 0 === t2.coeff > 0) return null // same sign - not a difference

  const pos = t1.coeff > 0 ? t1 : t2
  const neg = t1.coeff > 0 ? t2 : t1
  const a = perfectSquareRoot(pos)
  const b = perfectSquareRoot({ coeff: -neg.coeff, powers: neg.powers })
  if (!a || !b) return null

  return [addPoly([a], [b], -1), addPoly([a], [b], 1)]
}

// a^2 + 2ab + b^2 -> (a+b)^2, or a^2 - 2ab + b^2 -> (a-b)^2
function tryPerfectSquareTrinomial(expr: PolyExpr): [PolyExpr, PolyExpr] | null {
  if (expr.length !== 3) return null
  const sorted = [...expr].sort((x, y) => Object.values(y.powers).reduce((s, e) => s + e, 0) - Object.values(x.powers).reduce((s, e) => s + e, 0))
  const [first, middle, last] = sorted

  const a = perfectSquareRoot(first)
  const b = perfectSquareRoot(last)
  if (!a || !b) return null

  const expectedMiddle: PolyTerm = { coeff: 2 * a.coeff * b.coeff, powers: mulPoly([a], [b])[0]?.powers ?? {} }
  if (termsEqual(middle, expectedMiddle)) return [addPoly([a], [b], 1), addPoly([a], [b], 1)]
  if (termsEqual(middle, { ...expectedMiddle, coeff: -expectedMiddle.coeff })) return [addPoly([a], [b], -1), addPoly([a], [b], -1)]
  return null
}

function divisorsOf(n: number): number[] {
  n = Math.abs(Math.round(n))
  if (n === 0) return [1]
  const out: number[] = []
  for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i)
  return out
}

// Factors a single-variable quadratic a*x^2 + b*x + c (integer coefficients) into two linear
// binomials by searching for rational roots p/q via the rational root theorem, then dividing
// them out - e.g. 2x^2 + 7x + 3 -> (x+3)(2x+1)
function tryFactorQuadratic(expr: PolyExpr): [PolyExpr, PolyExpr] | null {
  const vars = variablesOf(expr)
  if (vars.length !== 1) return null
  const variable = vars[0]
  const arr = toCoeffArray(expr, variable)
  if (!arr || arr.length !== 3) return null // must be degree exactly 2
  const [c, b, a] = arr
  if (![a, b, c].every(n => Math.abs(n - Math.round(n)) < 1e-9)) return null // integer coefficients only

  for (const q of divisorsOf(a)) {
    for (const pAbs of divisorsOf(c)) {
      for (const p of [pAbs, -pAbs]) {
        if (gcdInt(Math.abs(p), q) !== 1) continue
        const value = a * (p / q) * (p / q) + b * (p / q) + c
        if (Math.abs(value) > 1e-6) continue

        const { quotient, remainder } = polyLongDivide([c, b, a], [-p, q])
        if (!isZeroArray(remainder) || quotient.length !== 2) continue

        const factor1 = coeffArrayToPoly([-p, q], variable) // qx - p
        const factor2 = coeffArrayToPoly(quotient, variable)
        return [factor1, factor2]
      }
    }
  }
  return null
}

function formatFactor(expr: PolyExpr): string {
  const str = formatPolynomial(expr)
  return expr.length > 1 ? `(${str})` : str
}

export interface FactorResult {
  factoredForm: string
  fullyFactored: boolean
}

// Factors a polynomial into a product of irreducible-ish pieces: pulls out the GCF, then
// tries difference of squares, a perfect square trinomial, and general quadratic factoring
// (via rational roots) on what's left.
export function factorPolynomial(exprString: string): FactorResult | { error: string } {
  let expr: PolyExpr
  try { expr = parsePolynomial(exprString) } catch (e) { return { error: e instanceof Error ? e.message : "Could not parse the expression" } }

  expr = expr.filter(t => Math.abs(t.coeff) > 1e-9)
  if (expr.length === 0) return { error: "Enter a polynomial with at least one term" }
  // A single term is already in simplest form - "x" isn't usefully "x * 1"
  if (expr.length === 1) return { factoredForm: formatPolynomial(expr), fullyFactored: false }

  const gcm = extractGCM(expr)
  const remaining = isTrivialMonomial(gcm) ? expr : divideByMonomial(expr, gcm)
  const gcfPart = isTrivialMonomial(gcm) ? "" : formatFactor([gcm])

  if (remaining.length <= 1) {
    const form = gcfPart ? `${gcfPart}${formatFactor(remaining)}` : formatPolynomial(remaining)
    return { factoredForm: form, fullyFactored: !isTrivialMonomial(gcm) }
  }

  const squareFactors = tryPerfectSquareTrinomial(remaining)
  const diffSquareFactors = !squareFactors ? tryDifferenceOfSquares(remaining) : null
  const quadraticFactors = !squareFactors && !diffSquareFactors ? tryFactorQuadratic(remaining) : null
  const found = squareFactors ?? diffSquareFactors ?? quadraticFactors

  if (!found) {
    const form = gcfPart ? `${gcfPart}${formatFactor(remaining)}` : formatPolynomial(remaining)
    return { factoredForm: form, fullyFactored: !isTrivialMonomial(gcm) }
  }

  const [f1, f2] = found
  const isSquare = squareFactors !== null
  const factorsStr = isSquare ? `${formatFactor(f1)}^2` : `${formatFactor(f1)}${formatFactor(f2)}`
  return { factoredForm: `${gcfPart}${factorsStr}`, fullyFactored: true }
}
