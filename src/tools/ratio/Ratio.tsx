import { useState } from "react"
import CopyButton from "../../components/CopyButton"
import ResultDisplay from "../../components/ResultDisplay"
import {
  simplifyRatio,
  findMissingValue,
  scaleRatio,
  ratioToDecimal,
  ratioToPercent,
  compareRatios,
} from "./calc"

export default function Ratio() {
  const [mode, setMode] = useState<"simplify" | "missing" | "scale" | "decimal" | "percent" | "compare">("simplify")
  const [a, setA] = useState("")
  const [b, setB] = useState("")
  const [c, setC] = useState("")
  const [d, setD] = useState("")
  const [factor, setFactor] = useState("")
  const [result, setResult] = useState<string>("—")

  function calculate() {
    const numA = Number(a)
    const numB = Number(b)
    const numC = Number(c)
    const numD = Number(d)
    const numFactor = Number(factor)

    switch (mode) {
      case "simplify": {
        if (isNaN(numA) || isNaN(numB)) return
        const [sA, sB] = simplifyRatio(numA, numB)
        setResult(`${sA}:${sB}`)
        break
      }
      case "missing": {
        if (isNaN(numA) || isNaN(numB) || isNaN(numC)) return
        const missing = findMissingValue(numA, numB, numC)
        setResult(String(missing))
        break
      }
      case "scale": {
        if (isNaN(numA) || isNaN(numB) || isNaN(numFactor)) return
        const [sA, sB] = scaleRatio(numA, numB, numFactor)
        setResult(`${sA}:${sB}`)
        break
      }
      case "decimal": {
        if (isNaN(numA) || isNaN(numB)) return
        setResult(String(ratioToDecimal(numA, numB)))
        break
      }
      case "percent": {
        if (isNaN(numA) || isNaN(numB)) return
        setResult(`${ratioToPercent(numA, numB).toFixed(2)}%`)
        break
      }
      case "compare": {
        if (isNaN(numA) || isNaN(numB) || isNaN(numC) || isNaN(numD)) return
        setResult(compareRatios(numA, numB, numC, numD))
        break
      }
    }
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Ratio Calculator</h2>
        <span className="badge-secondary ui-blue">Multi-Mode</span>
      </div>

      <select className="form-input" value={mode} onChange={e => setMode(e.target.value as any)}>
        <option value="simplify">Simplify Ratio</option>
        <option value="missing">Find Missing Value</option>
        <option value="scale">Scale Ratio</option>
        <option value="decimal">Ratio to Decimal</option>
        <option value="percent">Ratio to Percent</option>
        <option value="compare">Compare Ratios</option>
      </select>

      {mode === "simplify" && (
        <div className="grid grid-cols-2 gap-4">
          <input
            className="form-input"
            value={a}
            onChange={e => setA(e.target.value)}
            placeholder="First value (e.g., 10)"
          />
          <input
            className="form-input"
            value={b}
            onChange={e => setB(e.target.value)}
            placeholder="Second value (e.g., 5)"
          />
        </div>
      )}

      {mode === "missing" && (
        <div className="grid grid-cols-3 gap-4">
          <input
            className="form-input"
            value={a}
            onChange={e => setA(e.target.value)}
            placeholder="A (e.g., 10)"
          />
          <input
            className="form-input"
            value={b}
            onChange={e => setB(e.target.value)}
            placeholder="B (e.g., 5)"
          />
          <input
            className="form-input"
            value={c}
            onChange={e => setC(e.target.value)}
            placeholder="C (e.g., 20)"
          />
        </div>
      )}

      {mode === "scale" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              className="form-input"
              value={a}
              onChange={e => setA(e.target.value)}
              placeholder="First value (e.g., 2)"
            />
            <input
              className="form-input"
              value={b}
              onChange={e => setB(e.target.value)}
              placeholder="Second value (e.g., 1)"
            />
          </div>
          <input
            className="form-input"
            value={factor}
            onChange={e => setFactor(e.target.value)}
            placeholder="Scale factor (e.g., 5)"
          />
        </div>
      )}

      {mode === "decimal" && (
        <div className="grid grid-cols-2 gap-4">
          <input
            className="form-input"
            value={a}
            onChange={e => setA(e.target.value)}
            placeholder="First value (e.g., 3)"
          />
          <input
            className="form-input"
            value={b}
            onChange={e => setB(e.target.value)}
            placeholder="Second value (e.g., 4)"
          />
        </div>
      )}

      {mode === "percent" && (
        <div className="grid grid-cols-2 gap-4">
          <input
            className="form-input"
            value={a}
            onChange={e => setA(e.target.value)}
            placeholder="First value (e.g., 1)"
          />
          <input
            className="form-input"
            value={b}
            onChange={e => setB(e.target.value)}
            placeholder="Second value (e.g., 4)"
          />
        </div>
      )}

      {mode === "compare" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <input
              className="form-input"
              value={a}
              onChange={e => setA(e.target.value)}
              placeholder="First ratio A (e.g., 2)"
            />
            <input
              className="form-input"
              value={b}
              onChange={e => setB(e.target.value)}
              placeholder="First ratio B (e.g., 3)"
            />
          </div>
          <div className="space-y-2">
            <input
              className="form-input"
              value={c}
              onChange={e => setC(e.target.value)}
              placeholder="Second ratio A (e.g., 4)"
            />
            <input
              className="form-input"
              value={d}
              onChange={e => setD(e.target.value)}
              placeholder="Second ratio B (e.g., 5)"
            />
          </div>
        </div>
      )}

      <button className="btn-primary w-full" onClick={calculate}>
        Calculate
      </button>

      <ResultDisplay value={result} />
    </div>
  )
}
