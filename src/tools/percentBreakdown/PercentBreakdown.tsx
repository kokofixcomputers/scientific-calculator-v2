import { useState } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import { Plus, X } from "lucide-react"
import { percentBreakdown, type PercentResult } from "./calc"

interface Row {
  label: string
  value: string
}

export default function PercentBreakdown() {
  const [rows, setRows] = useState<Row[]>([
    { label: "", value: "" },
    { label: "", value: "" },
  ])
  const [results, setResults] = useState<PercentResult[] | null>(null)

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

  function calculate() {
    const items = rows
      .map((row, i) => ({
        label: row.label.trim() || `Item ${i + 1}`,
        value: Number(row.value),
      }))
      .filter(item => !isNaN(item.value) && item.value >= 0)

    if (items.length < 2) {
      setResults(null)
      return
    }

    setResults(percentBreakdown(items))
  }

  const total = rows.reduce((sum, row) => {
    const n = Number(row.value)
    return sum + (isNaN(n) ? 0 : n)
  }, 0)

  const summary = results
    ? results.map(r => `${r.label}: ${r.percent.toFixed(2)}%`).join("  |  ")
    : "—"

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Percent Breakdown</h2>
        <span className="badge-secondary ui-teal">Share of Total</span>
      </div>

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
        <button className="btn-accent" onClick={calculate}>
          Calculate Percentages
        </button>
      </div>

      {results && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between glass rounded-lg p-3">
              <span className="font-medium">{r.label}</span>
              <span className="font-mono">
                {r.value} / {total} = {r.percent.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      )}

      <ResultDisplay value={summary} />
    </div>
  )
}
