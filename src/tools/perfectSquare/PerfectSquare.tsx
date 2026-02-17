import { useState, useEffect } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import { findPerfectSquares } from "./calc"
import { useToolContext } from "../../contexts/ToolContext"

export default function PerfectSquare() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<string>("—")
  const { consumePendingValue } = useToolContext()

  useEffect(() => {
    const pending = consumePendingValue()
    if (pending) setInput(pending)
  }, [])

  function handleFind() {
    const num = Number(input)
    if (isNaN(num) || num < 0) {
      setResult("Please enter a valid positive number")
      return
    }

    const squares = findPerfectSquares(num)
    if (!squares) {
      setResult("Invalid input")
      return
    }

    if (squares.lower === squares.upper) {
      setResult(`${num} is a perfect square! √${num} = ${squares.lowerRoot}`)
    } else {
      setResult(
        `Lower: ${squares.lower} (${squares.lowerRoot}²) | Upper: ${squares.upper} (${squares.upperRoot}²)`
      )
    }
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Perfect Square Finder</h2>
        <span className="badge-secondary ui-purple">Square Roots</span>
      </div>

      <input
        className="form-input"
        type="number"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. 50"
        onKeyDown={(e) => e.key === 'Enter' && handleFind()}
      />

      <button className="btn-accent w-full" onClick={handleFind}>
        Find Perfect Squares
      </button>

      <ResultDisplay value={result} />
    </div>
  )
}
