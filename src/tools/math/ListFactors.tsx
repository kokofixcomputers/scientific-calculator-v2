import { useState } from "react"
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
    <div className="card space-y-6">
      <h2>List Factors</h2>

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
        {result}
      </div>
    </div>
  )
}