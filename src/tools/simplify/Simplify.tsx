import { useState, useEffect } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import { simplifyExpression } from "./calc"
import { useToolContext } from "../../contexts/ToolContext"

export default function Simplify() {
  const [expression, setExpression] = useState("")
  const [result, setResult] = useState<string>("—")
  const { consumePendingValue } = useToolContext()

  useEffect(() => {
    const pending = consumePendingValue()
    if (pending) setExpression(pending)
  }, [])

  function calculate() {
    if (expression.trim() === "") return
    setResult(simplifyExpression(expression))
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Simplify Expression</h2>
        <span className="badge-secondary ui-blue">Combine Like Terms</span>
      </div>

      <div className="space-y-3">
        <input
          className="form-input"
          value={expression}
          onChange={e => setExpression(e.target.value)}
          placeholder="e.g., 12+5x-18-x"
          type="text"
        />
        <p className="text-sm opacity-70">
          Supports multiple variables and constants, e.g. "2x + 3y - x + 5 - y".
        </p>
      </div>

      <div className="flex gap-3">
        <button className="btn-accent" onClick={calculate}>
          Simplify
        </button>
      </div>

      <ResultDisplay value={result} />
    </div>
  )
}
