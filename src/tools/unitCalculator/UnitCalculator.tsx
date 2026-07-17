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
  const [outputUnit, setOutputUnit] = useState("")
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
    setOutputUnit("")
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

    setResult(expr ? evaluateUnitExpression(expr, outputUnit || undefined) : "—")
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

      <div className="flex items-center gap-3">
        <span className="text-sm opacity-60 whitespace-nowrap">Output as</span>
        <select
          className="form-input"
          value={outputUnit}
          onChange={e => setOutputUnit(e.target.value)}
        >
          <option value="">Auto (mixed units)</option>
          {units.map(u => <option key={u} value={u}>{u} only</option>)}
        </select>
      </div>

      <ResultDisplay value={result} />
    </div>
  )
}
