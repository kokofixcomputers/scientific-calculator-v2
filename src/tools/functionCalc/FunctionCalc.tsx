import { useState, useEffect } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import { extractFunctionVariables, solveFunctionEquation } from "./calc"
import { useToolContext } from "../../contexts/ToolContext"

// Accepts a plain number, a fraction ("1/2"), or a mixed number ("2 1/2")
function parseNumberOrFraction(input: string): number {
  const trimmed = input.trim()
  if (trimmed === "") return NaN

  const mixedMatch = trimmed.match(/^(-?\d+)\s+(\d+)\/(\d+)$/)
  if (mixedMatch) {
    const whole = Number(mixedMatch[1])
    const num = Number(mixedMatch[2])
    const den = Number(mixedMatch[3])
    if (den === 0) return NaN
    const sign = whole < 0 ? -1 : 1
    return whole + sign * (num / den)
  }

  const fracMatch = trimmed.match(/^(-?\d+\.?\d*)\/(-?\d+\.?\d*)$/)
  if (fracMatch) {
    const num = Number(fracMatch[1])
    const den = Number(fracMatch[2])
    if (isNaN(num) || isNaN(den) || den === 0) return NaN
    return num / den
  }

  return Number(trimmed)
}

export default function FunctionCalc() {
  const [equation, setEquation] = useState("x = y^2 - 4")
  const [values, setValues] = useState<Record<string, string>>({})
  const [result, setResult] = useState<string>("—")
  const { consumePendingValue } = useToolContext()

  useEffect(() => {
    const pending = consumePendingValue()
    if (pending) setEquation(pending)
  }, [])

  const variables = (() => {
    try {
      return extractFunctionVariables(equation)
    } catch {
      return []
    }
  })()

  function updateValue(name: string, value: string) {
    setValues({ ...values, [name]: value })
  }

  function calculate() {
    const blank = variables.filter(v => !values[v] || values[v].trim() === "")
    if (blank.length !== 1) {
      setResult(
        blank.length === 0
          ? "Leave exactly one variable blank - that's the one it solves for"
          : `Leave exactly one variable blank (currently blank: ${blank.join(", ")})`
      )
      return
    }

    const unknownVar = blank[0]
    const knownValues: Record<string, number> = {}
    for (const v of variables) {
      if (v === unknownVar) continue
      const num = parseNumberOrFraction(values[v])
      if (isNaN(num)) {
        setResult(`"${values[v]}" is not a valid number for ${v}`)
        return
      }
      knownValues[v] = num
    }

    const outcome = solveFunctionEquation(equation, knownValues, unknownVar)
    if ("error" in outcome) {
      setResult(outcome.error)
      return
    }

    setResult(outcome.values.map(v => `${unknownVar} = ${v}`).join("  or  "))
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Function Calculator</h2>
        <span className="badge-secondary ui-purple">Any Equation, Any Variable</span>
      </div>

      <input
        className="form-input"
        value={equation}
        onChange={(e) => setEquation(e.target.value)}
        placeholder="e.g. x = y^2 - 4, x^2 + y^2 = 25, sqrt(x) = y"
      />

      {variables.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm opacity-60">Fill in every variable except the one you want solved for</p>
          <div className="grid grid-cols-2 gap-4">
            {variables.map(v => (
              <div key={v} className="flex items-center gap-2">
                <span className="opacity-60 whitespace-nowrap">{v} =</span>
                <input
                  className="form-input"
                  value={values[v] ?? ""}
                  onChange={(e) => updateValue(v, e.target.value)}
                  placeholder="leave blank to solve"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="btn-accent w-full" onClick={calculate}>
        Calculate
      </button>

      <ResultDisplay value={result} />
    </div>
  )
}
