import { useState, useEffect } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import { listFactors } from "./calc"
import { useToolContext } from "../../contexts/ToolContext"

export default function ListFactors() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<string>("—")
  const { consumePendingValue } = useToolContext()

  useEffect(() => {
    const pending = consumePendingValue()
    if (pending) setInput(pending)
  }, [])

  function calculate() {
    const num = parseInt(input)
    if (isNaN(num) || num < 1) return
    
    const factors = listFactors(num)
    setResult(factors.join(", "))
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>List Factors</h2>
        <span className="badge-secondary ui-indigo">Complete List</span>
      </div>

      <input
        className="form-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter a number"
        type="number"
      />

      <button className="btn-accent" onClick={calculate}>
        List All Factors
      </button>

      <ResultDisplay value={result} />
    </div>
  )
}