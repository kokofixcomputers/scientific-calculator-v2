import { useState } from "react"
import { Plus, X } from "lucide-react"
import { solveTwoNumbers, type Rule, type RuleType } from "./calc"

const RULE_LABELS: { value: RuleType; label: string }[] = [
  { value: "sum", label: "Sum equals" },
  { value: "difference", label: "Difference (first − second) equals" },
  { value: "product", label: "Product equals" },
  { value: "quotient", label: "Quotient (first ÷ second) equals" },
  { value: "average", label: "Average equals" },
  { value: "sumOfSquares", label: "Sum of squares equals" },
]

interface RuleRow {
  type: RuleType
  value: string
}

export default function NumberFinder() {
  const [rules, setRules] = useState<RuleRow[]>([
    { type: "sum", value: "" },
    { type: "product", value: "" },
  ])
  const [result, setResult] = useState<string>("—")

  function addRule() {
    setRules([...rules, { type: "sum", value: "" }])
  }

  function removeRule(index: number) {
    if (rules.length > 1) {
      setRules(rules.filter((_, i) => i !== index))
    }
  }

  function updateRule(index: number, field: keyof RuleRow, value: string) {
    const newRules = [...rules]
    newRules[index] = { ...newRules[index], [field]: value }
    setRules(newRules)
  }

  function calculate() {
    const parsed: Rule[] = rules
      .filter(r => r.value.trim() !== "")
      .map(r => ({ type: r.type, value: Number(r.value) }))
      .filter(r => !isNaN(r.value))

    const outcome = solveTwoNumbers(parsed)
    if ("error" in outcome) {
      setResult(outcome.error)
      return
    }

    setResult(
      outcome.solutions
        .map(s => `${s.x} and ${s.y}`)
        .join("  |  ")
    )
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Number Finder</h2>
        <span className="badge-secondary ui-purple">Rule-Based Solver</span>
      </div>

      <p className="text-sm opacity-60">
        Find two numbers matching a set of rules, e.g. sum is 22 and product is 112 - keep adding
        rules as you need them.
      </p>

      <div className="space-y-3">
        {rules.map((rule, index) => (
          <div key={index} className="flex gap-2">
            <select
              className="form-input flex-1"
              value={rule.type}
              onChange={e => updateRule(index, "type", e.target.value)}
            >
              {RULE_LABELS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <input
              className="form-input w-28"
              value={rule.value}
              onChange={e => updateRule(index, "value", e.target.value)}
              placeholder="Value"
              type="number"
            />
            {rules.length > 1 && (
              <button className="btn-danger px-3" onClick={() => removeRule(index)}>
                <X size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button className="btn-secondary" onClick={addRule}>
          <Plus size={16} className="mr-2" />
          Add Rule
        </button>
        <button className="btn-accent" onClick={calculate}>
          Find Numbers
        </button>
      </div>

      <div className="glass rounded-lg p-4 font-mono text-lg">{result}</div>
    </div>
  )
}
