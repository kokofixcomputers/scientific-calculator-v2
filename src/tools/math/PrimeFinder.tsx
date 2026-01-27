import { useState } from "react"
import { findPrimes } from "./calc"

export default function PrimeFinder() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<string>("—")

  function calculate() {
    const limit = parseInt(input)
    if (isNaN(limit) || limit < 2) return
    
    const primes = findPrimes(limit)
    if (primes.length > 50) {
      setResult(`${primes.slice(0, 50).join(", ")}... (${primes.length} total primes)`)
    } else {
      setResult(primes.join(", "))
    }
  }

  return (
    <div className="card space-y-6">
      <h2>Prime Finder</h2>

      <input
        className="form-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Find primes up to..."
        type="number"
      />

      <button className="btn-accent" onClick={calculate}>
        Find Primes
      </button>

      <div className="glass rounded-lg p-4 font-mono text-lg max-h-40 overflow-y-auto">
        {result}
      </div>
    </div>
  )
}