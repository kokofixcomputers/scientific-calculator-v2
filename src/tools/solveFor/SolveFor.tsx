import { useState, useEffect } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import { solveEquation, extractVariables } from "./calc"
import { useToolContext } from "../../contexts/ToolContext"

export default function SolveFor() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<string>("—")
  const [selectedVariable, setSelectedVariable] = useState("")
  const { consumePendingValue } = useToolContext()

  useEffect(() => {
    const pending = consumePendingValue()
    if (pending) setInput(pending)
  }, [])

  const variables = extractVariables(input)

  useEffect(() => {
    if (!variables.includes(selectedVariable)) {
      setSelectedVariable(variables[0] ?? "")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variables.join(",")])

  function handleSolve() {
    if (!input.trim()) return
    const solution = solveEquation(input, variables.length > 1 ? selectedVariable : undefined)
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
        placeholder="e.g. -10 + 10s = 60, 115/100 = 1426/p, 60 = x%*100"
        onKeyDown={(e) => e.key === 'Enter' && handleSolve()}
      />

      {variables.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-60 whitespace-nowrap">Solve for</span>
          <select
            className="form-input"
            value={selectedVariable}
            onChange={(e) => setSelectedVariable(e.target.value)}
          >
            {variables.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      )}

      <button className="btn-accent w-full" onClick={handleSolve}>
        Solve
      </button>

      <ResultDisplay value={result} />
    </div>
  )
}
