import { groups } from "../unit-converter/calc"

// Common alternate spellings mapped onto the canonical abbreviation used in `groups`
const ALIASES: Record<string, string> = {
  inch: "in", inches: "in",
  foot: "ft", feet: "ft",
  yard: "yd", yards: "yd",
  mile: "mi", miles: "mi",
  pound: "lb", pounds: "lb", lbs: "lb",
  ounce: "oz", ounces: "oz",
  gallon: "gal", gallons: "gal",
  quart: "qt", quarts: "qt",
  pint: "pt", pints: "pt",
  cups: "cup",
  sec: "s", secs: "s", second: "s", seconds: "s",
  mins: "min", minute: "min", minutes: "min",
  hrs: "hr", hour: "hr", hours: "hr",
  days: "day", weeks: "week", months: "month", years: "year",
  bytes: "byte",
  kilobyte: "kb", kilobytes: "kb",
  megabyte: "mb", megabytes: "mb",
  gigabyte: "gb", gigabytes: "gb",
  terabyte: "tb", terabytes: "tb",
  acres: "acre", hectares: "hectare", knots: "knot",
}

interface UnitInfo {
  group: string
  unit: string
  factor: number // count of `unit` per 1 base unit of `group`
}

function findUnit(raw: string): UnitInfo | null {
  for (const group in groups) {
    if (raw in groups[group]) return { group, unit: raw, factor: groups[group][raw] }
  }
  const alias = ALIASES[raw.toLowerCase()]
  if (alias) {
    for (const group in groups) {
      if (alias in groups[group]) return { group, unit: alias, factor: groups[group][alias] }
    }
  }
  return null
}

interface Quantity {
  value: number // magnitude in `unit` (or a plain scalar if unit is null)
  unit: string | null
  group: string | null
}

type Token =
  | { type: "num"; value: number; unit: string | null }
  | { type: "op"; value: string }

function tokenize(expr: string): Token[] | { error: string } {
  const cleaned = expr.replace(/\s+/g, "")
  const tokens: Token[] = []
  // Unit letters stop before x/X/× so "5inx10" splits into unit "in" + multiply, not a fictitious unit "inx"
  const pattern = /(\d+\.?\d*)((?:(?!x|X|×)[a-zA-Zµ])*)|([+\-*/xX×÷])/g
  let match: RegExpExecArray | null
  let lastIndex = 0

  while ((match = pattern.exec(cleaned)) !== null) {
    if (match.index !== lastIndex) return { error: `Could not parse "${cleaned.slice(lastIndex, match.index)}"` }
    lastIndex = pattern.lastIndex

    if (match[3]) {
      const op = match[3] === "x" || match[3] === "X" || match[3] === "×" ? "*"
        : match[3] === "÷" ? "/"
        : match[3]
      tokens.push({ type: "op", value: op })
    } else {
      tokens.push({ type: "num", value: Number(match[1]), unit: match[2] ? match[2] : null })
    }
  }

  if (lastIndex !== cleaned.length) return { error: `Could not parse "${cleaned.slice(lastIndex)}"` }
  return tokens
}

class Parser {
  tokens: Token[]
  pos = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  peek(): Token | null {
    return this.tokens[this.pos] ?? null
  }

  next(): Token | null {
    return this.tokens[this.pos++] ?? null
  }

  parseExpression(): Quantity {
    let left = this.parseTerm()
    while (true) {
      const tok = this.peek()
      if (tok?.type === "op" && (tok.value === "+" || tok.value === "-")) {
        this.next()
        const right = this.parseTerm()
        left = this.combineAdditive(left, right, tok.value)
      } else break
    }
    return left
  }

  parseTerm(): Quantity {
    let left = this.parseFactor()
    while (true) {
      const tok = this.peek()
      if (tok?.type === "op" && (tok.value === "*" || tok.value === "/")) {
        this.next()
        const right = this.parseFactor()
        left = this.combineMultiplicative(left, right, tok.value)
      } else break
    }
    return left
  }

  parseFactor(): Quantity {
    const tok = this.peek()
    if (tok?.type === "op" && tok.value === "-") {
      this.next()
      const inner = this.parseFactor()
      return { ...inner, value: -inner.value }
    }
    if (tok?.type === "num") {
      this.next()
      if (tok.unit === null) return { value: tok.value, unit: null, group: null }
      const info = findUnit(tok.unit)
      if (!info) throw new Error(`Unrecognized unit "${tok.unit}"`)
      let quantity: Quantity = { value: tok.value, unit: info.unit, group: info.group }

      // Adjacent quantities with no operator between them are a compound measurement,
      // e.g. "3ft 8in" means (3ft + 8in), not "3ft" times "8in" or a parse error.
      while (true) {
        const next = this.peek()
        if (next?.type !== "num" || next.unit === null) break
        this.next()
        const nextInfo = findUnit(next.unit)
        if (!nextInfo) throw new Error(`Unrecognized unit "${next.unit}"`)
        quantity = this.combineAdditive(
          quantity,
          { value: next.value, unit: nextInfo.unit, group: nextInfo.group },
          "+"
        )
      }
      return quantity
    }
    throw new Error("Expected a number")
  }

  combineAdditive(a: Quantity, b: Quantity, op: string): Quantity {
    if (a.unit === null && b.unit === null) {
      return { value: op === "+" ? a.value + b.value : a.value - b.value, unit: null, group: null }
    }
    if (a.unit === null || b.unit === null) {
      throw new Error("Cannot add or subtract a plain number and a unit quantity")
    }
    if (a.group !== b.group) {
      throw new Error(`Cannot combine "${a.unit}" and "${b.unit}" - different unit categories`)
    }
    const map = groups[a.group as string]
    const aBase = a.value / map[a.unit]
    const bBase = b.value / map[b.unit]
    const resultBase = op === "+" ? aBase + bBase : aBase - bBase
    return { value: resultBase * map[a.unit], unit: a.unit, group: a.group }
  }

  combineMultiplicative(a: Quantity, b: Quantity, op: string): Quantity {
    if (op === "*") {
      if (a.unit !== null && b.unit !== null) {
        throw new Error("Cannot multiply two unit quantities together")
      }
      if (a.unit === null && b.unit === null) {
        return { value: a.value * b.value, unit: null, group: null }
      }
      const quantity = a.unit !== null ? a : b
      const scalar = a.unit !== null ? b : a
      return { value: quantity.value * scalar.value, unit: quantity.unit, group: quantity.group }
    }

    // division
    if (b.unit === null) {
      if (b.value === 0) throw new Error("Division by zero")
      return { value: a.value / b.value, unit: a.unit, group: a.group }
    }
    if (a.unit === null) {
      throw new Error("Cannot divide a plain number by a unit quantity")
    }
    if (a.group !== b.group) {
      throw new Error(`Cannot divide "${a.unit}" by "${b.unit}" - different unit categories`)
    }
    const map = groups[a.group as string]
    const aBase = a.value / map[a.unit]
    const bBase = b.value / map[b.unit]
    if (bBase === 0) throw new Error("Division by zero")
    return { value: aBase / bBase, unit: null, group: null }
  }
}

function cleanNumber(n: number): number {
  return Number.isFinite(n) ? Number(n.toPrecision(10)) : n
}

// Formats a base-unit value back into the mixed units used in the expression,
// carrying overflow between them (e.g. 4 min + 70 s -> "5min 10s")
function formatBreakdown(baseValue: number, group: string, unitsUsed: string[]): string {
  const map = groups[group]
  const sign = baseValue < 0 ? "-" : ""
  const total = Math.abs(baseValue)

  const units = Array.from(new Set(unitsUsed)).sort((a, b) => map[a] - map[b])

  if (units.length === 1) {
    return `${sign}${cleanNumber(total * map[units[0]])}${units[0]}`
  }

  let remaining = total
  const parts: { unit: string; value: number }[] = []

  for (let i = 0; i < units.length - 1; i++) {
    const unit = units[i]
    const whole = Math.floor(remaining * map[unit] + 1e-9)
    parts.push({ unit, value: whole })
    remaining -= whole / map[unit]
  }

  const lastUnit = units[units.length - 1]
  // Round the leftover to 4 decimal places - mixing units with no clean integer
  // ratio (e.g. meters and feet) otherwise leaves 10+ digits of float noise
  const lastValue = Math.round(remaining * map[lastUnit] * 1e4) / 1e4
  parts.push({ unit: lastUnit, value: cleanNumber(lastValue) })

  // Drop leading zero units (e.g. "0ft 5in" -> "5in"), but keep zeros in the
  // middle/end so a unit the user actually typed doesn't silently vanish
  const firstNonZero = parts.findIndex(p => p.value !== 0)
  const visible = firstNonZero === -1 ? parts.slice(-1) : parts.slice(firstNonZero)
  return sign + visible.map(p => `${p.value}${p.unit}`).join(" ")
}

// outputUnits: leave empty/undefined for auto (derived from the units typed in the expression).
// One unit forces a single-unit result (e.g. "36in"). Two or more merge into a carried
// breakdown across exactly those units, same as "combine" does, e.g. ["min","s"] -> "35min 35s".
export function evaluateUnitExpression(expression: string, outputUnits?: string[]): string {
  if (!expression.trim()) return "—"

  const tokens = tokenize(expression)
  if ("error" in tokens) return tokens.error
  if (tokens.length === 0) return "—"

  try {
    const parser = new Parser(tokens)
    const result = parser.parseExpression()
    if (parser.pos !== tokens.length) return "Could not parse the full expression"

    if (result.unit === null) return String(cleanNumber(result.value))

    const baseValue = result.value / groups[result.group as string][result.unit]

    if (outputUnits && outputUnits.length > 0) {
      const resolved: string[] = []
      for (const raw of outputUnits) {
        const info = findUnit(raw)
        if (!info) return `Unrecognized unit "${raw}"`
        if (info.group !== result.group) return `Cannot express the result in "${raw}" - different unit category`
        resolved.push(info.unit)
      }
      return formatBreakdown(baseValue, result.group as string, resolved)
    }

    const unitsUsed = tokens
      .filter((t): t is Token & { type: "num" } => t.type === "num" && t.unit !== null)
      .map(t => findUnit(t.unit as string)?.unit)
      .filter((u): u is string => !!u)

    return formatBreakdown(baseValue, result.group as string, unitsUsed)
  } catch (e) {
    return e instanceof Error ? e.message : "Error evaluating expression"
  }
}
