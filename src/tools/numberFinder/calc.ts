export type RuleType = "sum" | "difference" | "product" | "quotient" | "average" | "sumOfSquares"

export interface Rule {
  type: RuleType
  value: number
}

export interface Solution {
  x: number
  y: number
}

const LINEAR_TYPES: RuleType[] = ["sum", "difference", "quotient", "average"]

function isLinear(type: RuleType): boolean {
  return LINEAR_TYPES.includes(type)
}

// Every linear rule can be rewritten as x = a*y + b
function linearCoeffs(rule: Rule): { a: number; b: number } | null {
  switch (rule.type) {
    case "sum": return { a: -1, b: rule.value } // x + y = S -> x = -y + S
    case "difference": return { a: 1, b: rule.value } // x - y = D -> x = y + D
    case "quotient": return { a: rule.value, b: 0 } // x / y = R -> x = R*y
    case "average": return { a: -1, b: rule.value * 2 } // (x+y)/2 = A -> x = -y + 2A
    default: return null
  }
}

function checkRule(rule: Rule, x: number, y: number): boolean {
  const tolerance = 1e-6 * Math.max(1, Math.abs(rule.value))
  let actual: number
  switch (rule.type) {
    case "sum": actual = x + y; break
    case "difference": actual = x - y; break
    case "product": actual = x * y; break
    case "quotient": if (y === 0) return false; actual = x / y; break
    case "average": actual = (x + y) / 2; break
    case "sumOfSquares": actual = x * x + y * y; break
  }
  return Math.abs(actual - rule.value) < tolerance
}

function solveQuadratic(a: number, b: number, c: number): number[] {
  if (a === 0) {
    if (b === 0) return []
    return [-c / b]
  }
  const discriminant = b * b - 4 * a * c
  if (discriminant < -1e-9) return []
  const sqrtD = Math.sqrt(Math.max(discriminant, 0))
  return [(-b + sqrtD) / (2 * a), (-b - sqrtD) / (2 * a)]
}

function dedupe(candidates: Solution[]): Solution[] {
  const unique: Solution[] = []
  for (const c of candidates) {
    const isDup = unique.some(u =>
      (Math.abs(u.x - c.x) < 1e-6 && Math.abs(u.y - c.y) < 1e-6) ||
      (Math.abs(u.x - c.y) < 1e-6 && Math.abs(u.y - c.x) < 1e-6)
    )
    if (!isDup) unique.push(c)
  }
  return unique
}

export function solveTwoNumbers(rules: Rule[]): { solutions: Solution[] } | { error: string } {
  if (rules.length === 0) return { error: "Add at least one rule" }

  const linearRules = rules.filter(r => isLinear(r.type))
  const nonlinearRules = rules.filter(r => !isLinear(r.type))

  if (linearRules.length === 0) {
    return { error: "Add at least one linear rule (sum, difference, quotient, or average) to relate the two numbers" }
  }

  const first = linearCoeffs(linearRules[0])!
  let candidates: Solution[] = []

  if (nonlinearRules.length > 0) {
    const rule = nonlinearRules[0]
    if (rule.type === "product") {
      // (a*y+b)*y = P  ->  a*y^2 + b*y - P = 0
      const roots = solveQuadratic(first.a, first.b, -rule.value)
      candidates = roots.map(y => ({ x: first.a * y + first.b, y }))
    } else {
      // sumOfSquares: (a*y+b)^2 + y^2 = SS  ->  (a^2+1)*y^2 + 2ab*y + (b^2-SS) = 0
      const roots = solveQuadratic(first.a * first.a + 1, 2 * first.a * first.b, first.b * first.b - rule.value)
      candidates = roots.map(y => ({ x: first.a * y + first.b, y }))
    }
    if (candidates.length === 0) return { error: "No real solution exists for these rules" }
  } else if (linearRules.length >= 2) {
    const second = linearCoeffs(linearRules[1])!
    // first.a*y + first.b = second.a*y + second.b
    if (Math.abs(first.a - second.a) < 1e-9) {
      return { error: Math.abs(first.b - second.b) < 1e-9 ? "Infinite solutions - these rules don't pin down unique numbers" : "No solution - these rules contradict each other" }
    }
    const y = (second.b - first.b) / (first.a - second.a)
    candidates = [{ x: first.a * y + first.b, y }]
  } else {
    return { error: "Add one more rule (like a product, or another sum/difference-type rule) - one rule alone isn't enough to find both numbers" }
  }

  const valid = dedupe(candidates).filter(c => rules.every(r => checkRule(r, c.x, c.y)))
  if (valid.length === 0) return { error: "No pair of numbers satisfies all of these rules together" }

  return { solutions: valid }
}
