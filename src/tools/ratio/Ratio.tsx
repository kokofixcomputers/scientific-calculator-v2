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
  splitTotalByRatio,
  findOtherPart,
  ratioPartToTotal,
} from "./calc"

export default function Ratio() {
  const [mode, setMode] = useState<"simplify" | "missing" | "scale" | "decimal" | "percent" | "compare" | "splitTotal" | "findOther" | "ratioToTotal">("simplify")
  const [a, setA] = useState("")
  const [b, setB] = useState("")
  const [c, setC] = useState("")
  const [d, setD] = useState("")
  const [factor, setFactor] = useState("")
  const [total, setTotal] = useState("")
  const [knownValue, setKnownValue] = useState("")
  const [knownIsA, setKnownIsA] = useState(true)
  const [partValue, setPartValue] = useState("")
  const [result, setResult] = useState<string>("—")

  function calculate() {
    const numA = Number(a)
    const numB = Number(b)
    const numC = Number(c)
    const numD = Number(d)
    const numFactor = Number(factor)
    const numTotal = Number(total)
    const numKnownValue = Number(knownValue)
    const numPartValue = Number(partValue)

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
      case "splitTotal": {
        if (isNaN(numA) || isNaN(numB) || isNaN(numTotal)) return
        const [partA, partB] = splitTotalByRatio(numA, numB, numTotal)
        setResult(`${partA} and ${partB}`)
        break
      }
      case "findOther": {
        if (isNaN(numA) || isNaN(numB) || isNaN(numKnownValue)) return
        const other = findOtherPart(numA, numB, numKnownValue, knownIsA)
        setResult(String(other))
        break
      }
      case "ratioToTotal": {
        if (isNaN(numA) || isNaN(numB) || isNaN(numPartValue)) return
        const r = ratioPartToTotal(numA, numB, numPartValue)
        setResult(isNaN(r) ? "Invalid input" : String(r))
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
        <option value="missing">Solve a Proportion (A:B = C:?)</option>
        <option value="splitTotal">Split a Total by Ratio</option>
        <option value="findOther">Given One Part, Find the Other</option>
        <option value="ratioToTotal">Ratio Part is a Real Number, Find the Total</option>
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
        <div className="space-y-2">
          <p className="text-sm opacity-60">Solves the proportion below for the missing 4th value</p>
          <div className="flex items-center gap-2">
            <input
              className="form-input"
              value={a}
              onChange={e => setA(e.target.value)}
              placeholder="10"
            />
            <span className="opacity-60">:</span>
            <input
              className="form-input"
              value={b}
              onChange={e => setB(e.target.value)}
              placeholder="5"
            />
            <span className="opacity-60">=</span>
            <input
              className="form-input"
              value={c}
              onChange={e => setC(e.target.value)}
              placeholder="20"
            />
            <span className="opacity-60">:</span>
            <span className="form-input flex items-center justify-center opacity-60">?</span>
          </div>
        </div>
      )}

      {mode === "splitTotal" && (
        <div className="space-y-2">
          <p className="text-sm opacity-60">e.g. hats to scarves is 5:8, and combined there are 88 - how many of each?</p>
          <div className="flex items-center gap-2">
            <input
              className="form-input"
              value={a}
              onChange={e => setA(e.target.value)}
              placeholder="First share (e.g., 5)"
            />
            <span className="opacity-60">:</span>
            <input
              className="form-input"
              value={b}
              onChange={e => setB(e.target.value)}
              placeholder="Second share (e.g., 8)"
            />
          </div>
          <input
            className="form-input"
            value={total}
            onChange={e => setTotal(e.target.value)}
            placeholder="Combined total (e.g., 88)"
          />
        </div>
      )}

      {mode === "findOther" && (
        <div className="space-y-2">
          <p className="text-sm opacity-60">e.g. ties to scarves is 5:8, there are 8 ties - how many scarves?</p>
          <div className="flex items-center gap-2">
            <input
              className="form-input"
              value={a}
              onChange={e => setA(e.target.value)}
              placeholder="First share (e.g., 5)"
            />
            <span className="opacity-60">:</span>
            <input
              className="form-input"
              value={b}
              onChange={e => setB(e.target.value)}
              placeholder="Second share (e.g., 8)"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              className="form-input"
              value={knownIsA ? "a" : "b"}
              onChange={e => setKnownIsA(e.target.value === "a")}
            >
              <option value="a">Known amount is the first share</option>
              <option value="b">Known amount is the second share</option>
            </select>
            <input
              className="form-input"
              value={knownValue}
              onChange={e => setKnownValue(e.target.value)}
              placeholder="Known amount (e.g., 8)"
            />
          </div>
        </div>
      )}

      {mode === "ratioToTotal" && (
        <div className="space-y-2">
          <p className="text-sm opacity-60">e.g. the ratio is 4:9, and the 4-part is really 144 - what's the total?</p>
          <div className="flex items-center gap-2">
            <input
              className="form-input"
              value={a}
              onChange={e => setA(e.target.value)}
              placeholder="Ratio part (e.g., 4)"
            />
            <span className="opacity-60">:</span>
            <input
              className="form-input"
              value={b}
              onChange={e => setB(e.target.value)}
              placeholder="Ratio total (e.g., 9)"
            />
          </div>
          <input
            className="form-input"
            value={partValue}
            onChange={e => setPartValue(e.target.value)}
            placeholder="Real value of that part (e.g., 144)"
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
