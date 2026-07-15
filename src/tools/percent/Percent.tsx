import { useState } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import {
  percentOf,
  valueFromPercent,
  findWhole,
  percentChange,
  applyPercentChange,
} from "./calc"

type Mode = "percentOf" | "valueFromPercent" | "findWhole" | "percentChange" | "applyChange"

export default function Percent() {
  const [mode, setMode] = useState<Mode>("percentOf")
  const [a, setA] = useState("")
  const [b, setB] = useState("")
  const [direction, setDirection] = useState<"increase" | "decrease">("increase")
  const [result, setResult] = useState<string>("—")

  function calculate() {
    const numA = Number(a)
    const numB = Number(b)
    if (isNaN(numA) || isNaN(numB)) return

    switch (mode) {
      case "percentOf": {
        const r = percentOf(numA, numB)
        setResult(isNaN(r) ? "Invalid input" : `${r.toFixed(2)}%`)
        break
      }
      case "valueFromPercent": {
        const r = valueFromPercent(numA, numB)
        setResult(String(r))
        break
      }
      case "findWhole": {
        const r = findWhole(numA, numB)
        setResult(isNaN(r) ? "Invalid input" : String(r))
        break
      }
      case "percentChange": {
        const r = percentChange(numA, numB)
        if (isNaN(r)) {
          setResult("Invalid input")
        } else {
          setResult(`${r > 0 ? "+" : ""}${r.toFixed(2)}%`)
        }
        break
      }
      case "applyChange": {
        const r = applyPercentChange(numA, numB, direction)
        setResult(String(r))
        break
      }
    }
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Percent Calculator</h2>
        <span className="badge-secondary ui-teal">Multi-Mode</span>
      </div>

      <select className="form-input" value={mode} onChange={e => setMode(e.target.value as Mode)}>
        <option value="percentOf">X is what percent of Y</option>
        <option value="valueFromPercent">What is X% of Y</option>
        <option value="findWhole">X is Y% of what number</option>
        <option value="percentChange">Percent change from X to Y</option>
        <option value="applyChange">Increase/decrease X by Y%</option>
      </select>

      {mode === "percentOf" && (
        <div className="grid grid-cols-2 gap-4">
          <input className="form-input" value={a} onChange={e => setA(e.target.value)} placeholder="Part (e.g., 54)" />
          <input className="form-input" value={b} onChange={e => setB(e.target.value)} placeholder="Total (e.g., 120)" />
        </div>
      )}

      {mode === "valueFromPercent" && (
        <div className="grid grid-cols-2 gap-4">
          <input className="form-input" value={a} onChange={e => setA(e.target.value)} placeholder="Percent (e.g., 45)" />
          <input className="form-input" value={b} onChange={e => setB(e.target.value)} placeholder="Total (e.g., 120)" />
        </div>
      )}

      {mode === "findWhole" && (
        <div className="grid grid-cols-2 gap-4">
          <input className="form-input" value={a} onChange={e => setA(e.target.value)} placeholder="Part (e.g., 14)" />
          <input className="form-input" value={b} onChange={e => setB(e.target.value)} placeholder="Percent (e.g., 15)" />
        </div>
      )}

      {mode === "percentChange" && (
        <div className="grid grid-cols-2 gap-4">
          <input className="form-input" value={a} onChange={e => setA(e.target.value)} placeholder="From (e.g., 50)" />
          <input className="form-input" value={b} onChange={e => setB(e.target.value)} placeholder="To (e.g., 75)" />
        </div>
      )}

      {mode === "applyChange" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input className="form-input" value={a} onChange={e => setA(e.target.value)} placeholder="Value (e.g., 200)" />
            <input className="form-input" value={b} onChange={e => setB(e.target.value)} placeholder="Percent (e.g., 10)" />
          </div>
          <select className="form-input" value={direction} onChange={e => setDirection(e.target.value as "increase" | "decrease")}>
            <option value="increase">Increase by</option>
            <option value="decrease">Decrease by</option>
          </select>
        </div>
      )}

      <button className="btn-primary w-full" onClick={calculate}>
        Calculate
      </button>

      <ResultDisplay value={result} />
    </div>
  )
}
