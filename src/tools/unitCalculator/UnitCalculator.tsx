import { useState, useEffect } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import { Plus, X } from "lucide-react"
import { groups } from "../unit-converter/calc"
import { evaluateUnitExpression } from "./calc"
import { useToolContext } from "../../contexts/ToolContext"

const categories: { id: string; label: string }[] = [
  { id: "length", label: "Length / Distance" },
  { id: "weight", label: "Weight / Mass" },
  { id: "volume", label: "Volume" },
  { id: "area", label: "Area" },
  { id: "speed", label: "Speed" },
  { id: "time", label: "Time" },
  { id: "digital", label: "Digital Storage" },
  { id: "biblical", label: "Biblical Lengths" },
]

const operators = [
  { value: "+", label: "+" },
  { value: "-", label: "−" },
  { value: "*", label: "×" },
  { value: "/", label: "÷" },
  { value: " ", label: "combine (e.g. 3ft 8in)" },
]

interface Row {
  op: string
  value: string
  unit: string
}

export default function UnitCalculator() {
  const [category, setCategory] = useState("length")
  const [rows, setRows] = useState<Row[]>([
    { op: "+", value: "", unit: Object.keys(groups.length)[0] },
    { op: "+", value: "", unit: Object.keys(groups.length)[0] },
  ])
  const [outputUnits, setOutputUnits] = useState<string[]>([])
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [autoChecked, setAutoChecked] = useState(true)
  const [outputResults, setOutputResults] = useState<{ label: string; value: string }[]>([])
  const [result, setResult] = useState<string>("—")
  const { consumePendingValue } = useToolContext()

  useEffect(() => {
    const pending = consumePendingValue()
    if (pending) updateRow(0, "value", pending)
  }, [])

  const units = Object.keys(groups[category])

  function changeCategory(next: string) {
    setCategory(next)
    const firstUnit = Object.keys(groups[next])[0]
    setRows(rows.map(row => ({ ...row, unit: firstUnit })))
    setOutputUnits([])
    setSelectedIndices([])
    setAutoChecked(true)
  }

  function addOutputUnit() {
    const newIndex = outputUnits.length
    setOutputUnits([...outputUnits, units[0]])
    setSelectedIndices([...selectedIndices, newIndex])
  }

  function removeOutputUnit(index: number) {
    setOutputUnits(outputUnits.filter((_, i) => i !== index))
    setSelectedIndices(
      selectedIndices
        .filter(i => i !== index)
        .map(i => (i > index ? i - 1 : i))
    )
  }

  function updateOutputUnit(index: number, value: string) {
    setOutputUnits(outputUnits.map((u, i) => (i === index ? value : u)))
  }

  function toggleOutputUnit(index: number) {
    setSelectedIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  function addRow() {
    setRows([...rows, { op: "+", value: "", unit: units[0] }])
  }

  function removeRow(index: number) {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index))
    }
  }

  function updateRow(index: number, field: keyof Row, value: string) {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], [field]: value }
    setRows(newRows)
  }

  function calculate() {
    let expr = ""
    for (const row of rows) {
      const val = row.value.trim()
      if (!val) continue
      const term = `${val}${row.unit}`
      expr += expr ? `${row.op}${term}` : term
    }

    if (!expr) {
      setOutputResults([])
      setResult("—")
      return
    }

    const results: { label: string; value: string }[] = []
    if (autoChecked) {
      results.push({ label: "Auto (mixed units)", value: evaluateUnitExpression(expr) })
    }
    if (selectedIndices.length > 0) {
      // All checked units merge into one carried breakdown (e.g. min + s -> "35min 35s"),
      // not separate single-unit conversions
      const chosenUnits = selectedIndices.map(i => outputUnits[i])
      results.push({ label: chosenUnits.join(" + "), value: evaluateUnitExpression(expr, chosenUnits) })
    }

    setOutputResults(results)
    setResult(results.map(r => r.value).join("  |  "))
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Unit Calculator</h2>
        <span className="badge-secondary ui-blue">Mixed Units</span>
      </div>

      <select className="form-input" value={category} onChange={e => changeCategory(e.target.value)}>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </select>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="flex gap-2">
            {index > 0 && (
              <select
                className="form-input w-24"
                value={row.op}
                onChange={e => updateRow(index, "op", e.target.value)}
              >
                {operators.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            )}
            <input
              className="form-input flex-1"
              value={row.value}
              onChange={e => updateRow(index, "value", e.target.value)}
              placeholder="Value"
              type="number"
            />
            <select
              className="form-input w-24"
              value={row.unit}
              onChange={e => updateRow(index, "unit", e.target.value)}
            >
              <option value="">(number)</option>
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            {rows.length > 1 && (
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
          Add Value
        </button>
        <button className="btn-accent" onClick={calculate}>
          Calculate
        </button>
      </div>

      <div className="space-y-3">
        <span className="text-sm opacity-60 whitespace-nowrap">Output as (select any number)</span>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoChecked}
            onChange={e => setAutoChecked(e.target.checked)}
          />
          <span className="text-sm">Auto (mixed units)</span>
        </label>

        {outputUnits.map((u, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedIndices.includes(index)}
              onChange={() => toggleOutputUnit(index)}
            />
            <select
              className="form-input flex-1"
              value={u}
              onChange={e => updateOutputUnit(index, e.target.value)}
            >
              {units.map(uu => <option key={uu} value={uu}>{uu}</option>)}
            </select>
            <button className="btn-danger px-3" onClick={() => removeOutputUnit(index)}>
              <X size={16} />
            </button>
          </div>
        ))}

        <button className="btn-secondary" onClick={addOutputUnit}>
          <Plus size={16} className="mr-2" />
          Add Output Unit
        </button>
      </div>

      {outputResults.length > 1 && (
        <div className="space-y-2">
          {outputResults.map((r, i) => (
            <div key={i} className="flex items-center justify-between glass rounded-lg p-3">
              <span className="font-medium">{r.label}</span>
              <span className="font-mono">{r.value}</span>
            </div>
          ))}
        </div>
      )}

      <ResultDisplay value={result} />
    </div>
  )
}
