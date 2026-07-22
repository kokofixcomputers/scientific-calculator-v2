import { useState } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import { Plus, X } from "lucide-react"
import {
  percentOf,
  valueFromPercent,
  findWhole,
  percentChange,
  applyPercentChange,
  percentBreakdown,
  type PercentBreakdownResult,
} from "./calc"
import { percentToMixed } from "../fractions/calc"

type Mode = "percentOf" | "valueFromPercent" | "findWhole" | "percentChange" | "applyChange" | "breakdown" | "percentToMixed"

interface Row {
  label: string
  value: string
}

export default function Percent() {
  const [mode, setMode] = useState<Mode>("percentOf")
  const [a, setA] = useState("")
  const [b, setB] = useState("")
  const [direction, setDirection] = useState<"increase" | "decrease">("increase")
  const [result, setResult] = useState<string>("—")

  const [rows, setRows] = useState<Row[]>([
    { label: "", value: "" },
    { label: "", value: "" },
  ])
  const [breakdownResults, setBreakdownResults] = useState<PercentBreakdownResult[] | null>(null)

  function addRow() {
    setRows([...rows, { label: "", value: "" }])
  }

  function removeRow(index: number) {
    if (rows.length > 2) {
      setRows(rows.filter((_, i) => i !== index))
    }
  }

  function updateRow(index: number, field: keyof Row, value: string) {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], [field]: value }
    setRows(newRows)
  }

  const breakdownTotal = rows.reduce((sum, row) => {
    const n = Number(row.value)
    return sum + (isNaN(n) ? 0 : n)
  }, 0)

  function calculateBreakdown() {
    const items = rows
      .map((row, i) => ({
        label: row.label.trim() || `Item ${i + 1}`,
        value: Number(row.value),
      }))
      .filter(item => !isNaN(item.value) && item.value >= 0)

    if (items.length < 2) {
      setBreakdownResults(null)
      return
    }

    setBreakdownResults(percentBreakdown(items))
  }

  function calculate() {
    const numA = Number(a)

    if (mode === "percentToMixed") {
      if (isNaN(numA)) return
      const [w, n, d] = percentToMixed(numA)
      setResult(n === 0 ? String(w) : `${w} ${n}/${d}`)
      return
    }

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

  const breakdownSummary = breakdownResults
    ? breakdownResults.map(r => `${r.label}: ${r.percent.toFixed(2)}%`).join("  |  ")
    : "—"

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
        <option value="breakdown">Breakdown: share of a total</option>
        <option value="percentToMixed">Percent to mixed number</option>
      </select>

      {mode === "percentToMixed" && (
        <input className="form-input" value={a} onChange={e => setA(e.target.value)} placeholder="Percent (e.g., 156)" />
      )}

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

      {mode !== "breakdown" && (
        <>
          <button className="btn-primary w-full" onClick={calculate}>
            Calculate
          </button>

          <ResultDisplay value={result} />
        </>
      )}

      {mode === "breakdown" && (
        <>
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className="form-input flex-1"
                  value={row.label}
                  onChange={e => updateRow(index, "label", e.target.value)}
                  placeholder={`Item ${index + 1} name (e.g., Sleeping)`}
                />
                <input
                  className="form-input w-28"
                  value={row.value}
                  onChange={e => updateRow(index, "value", e.target.value)}
                  placeholder="Hours"
                  type="number"
                />
                {rows.length > 2 && (
                  <button className="btn-danger px-3" onClick={() => removeRow(index)}>
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button className="btn-secondary" onClick={addRow}>
              <Plus size={16} className="mr-2" />
              Add Item
            </button>
            <button className="btn-accent" onClick={calculateBreakdown}>
              Calculate Percentages
            </button>
          </div>

          {breakdownResults && (
            <div className="space-y-2">
              {breakdownResults.map((r, i) => (
                <div key={i} className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="font-medium">{r.label}</span>
                  <span className="font-mono">
                    {r.value} / {breakdownTotal} = {r.percent.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          )}

          <ResultDisplay value={breakdownSummary} />
        </>
      )}
    </div>
  )
}
