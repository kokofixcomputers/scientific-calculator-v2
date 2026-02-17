import { useState, useEffect } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import { solveEquation } from "./calc"
import { useToolContext } from "../../contexts/ToolContext"

export default function SolveFor() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<string>("—")
  const { consumePendingValue } = useToolContext()

  useEffect(() => {
    const pending = consumePendingValue()
    if (pending) setInput(pending)
  }, [])

  function handleSolve() {
    if (!input.trim()) return
    const solution = solveEquation(input)
    setResult(solution)
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Solve For Variable</h2>
        <span className="badge-secondary ui-blue">Linear Equations</span>
      </div>

      <input
        className="form-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. -10 + 10s = 60"
        onKeyDown={(e) => e.key === 'Enter' && handleSolve()}
      />

      <button className="btn-accent w-full" onClick={handleSolve}>
        Solve
      </button>

      <ResultDisplay value={result} />
    </div>
  )
}
