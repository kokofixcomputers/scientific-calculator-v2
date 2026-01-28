import { useState } from "react"
import CopyButton from "../../components/CopyButton"
import { listFactors } from "./calc"

export default function ListFactors() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<string>("—")

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

      <div className="glass rounded-lg p-4 font-mono text-lg">
        <div className="flex items-center justify-between">
          <span className="flex-1">{result}</span>
          <CopyButton value={result} />
        </div>
      </div>
    </div>
  )
}