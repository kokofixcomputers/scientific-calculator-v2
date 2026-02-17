import { useState, useEffect } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import { groups, convert, convertTemperature } from "./calc"
import { useToolContext } from "../../contexts/ToolContext"

export default function UnitConverter() {
  const [group, setGroup] = useState("length")
  const [value, setValue] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const { consumePendingValue } = useToolContext()

  useEffect(() => {
    const pending = consumePendingValue()
    if (pending) setValue(pending)
  }, [])

  const numeric = Number(value)
  let result: string = "—"

  if (!isNaN(numeric) && from && to) {
    result =
      group === "temperature"
        ? String(convertTemperature(numeric, from, to))
        : String(convert(numeric, from, to, group))
  }

  const units =
    group === "temperature"
      ? ["C", "F", "K"]
      : Object.keys(groups[group])

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Unit Converter</h2>
        <span className="badge-secondary ui-purple">Multi-Category</span>
      </div>

      <select className="form-input" value={group} onChange={e => setGroup(e.target.value)}>
        <option value="length">Length / Distance</option>
        <option value="weight">Weight / Mass</option>
        <option value="volume">Volume</option>
        <option value="area">Area</option>
        <option value="speed">Speed</option>
        <option value="time">Time</option>
        <option value="digital">Digital Storage</option>
        <option value="biblical">Biblical Lengths</option>
        <option value="temperature">Temperature</option>
      </select>

      <input
        className="form-input"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Value"
      />

      <div className="grid grid-cols-2 gap-4">
        <select className="form-input" value={from} onChange={e => setFrom(e.target.value)}>
          <option value="">From</option>
          {units.map(u => <option key={u} value={u}>{u}</option>)}
        </select>

        <select className="form-input" value={to} onChange={e => setTo(e.target.value)}>
          <option value="">To</option>
          {units.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      <ResultDisplay value={result} />
    </div>
  )
}
