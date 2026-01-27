import { useState } from "react"
import CopyButton from "../../components/CopyButton"
import {
  roundToPlace,
  roundToDecimals,
  roundToMultiple,
  type RoundingMode,
} from "./calc"

export default function Rounding() {
  const [value, setValue] = useState("")
  const [mode, setMode] = useState<RoundingMode>("place")
  const [place, setPlace] = useState(1)
  const [decimals, setDecimals] = useState(0)
  const [multiple, setMultiple] = useState("")

  const numberValue = Number(value)

  let result: number | string = ""

  if (value !== "" && !isNaN(numberValue)) {
    if (mode === "place") {
      result = roundToPlace(numberValue, place)
    }
    if (mode === "decimal") {
      result = roundToDecimals(numberValue, decimals)
    }
    if (mode === "multiple") {
      const m = Number(multiple)
      result =
        multiple === "" || isNaN(m)
          ? ""
          : roundToMultiple(numberValue, m)
    }
  }

  return (
    <div className="card space-y-6">
      <h2>Rounding</h2>

      {/* Input value */}
      <div className="form-group">
        <label className="form-label">Number</label>
        <input
          className="form-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a number"
        />
      </div>

      {/* Mode selector */}
      <div className="form-group">
        <label className="form-label">Rounding method</label>
        <select
          className="form-input"
          value={mode}
          onChange={(e) => setMode(e.target.value as RoundingMode)}
        >
          <option value="place">Round to place value</option>
          <option value="decimal">Round to decimal places</option>
          <option value="multiple">Round to nearest multiple</option>
        </select>
      </div>

      {/* Place value */}
      {mode === "place" && (
        <div className="form-group">
          <label className="form-label">Place</label>
          <select
            className="form-input"
            value={place}
            onChange={(e) => setPlace(Number(e.target.value))}
          >
            <option value={1}>Ones</option>
            <option value={10}>Tens</option>
            <option value={100}>Hundreds</option>
            <option value={1000}>Thousands</option>
            <option value={10000}>Ten thousands</option>
            <option value={100000}>Hundred thousands</option>
          </select>
        </div>
      )}

      {/* Decimal places */}
      {mode === "decimal" && (
        <div className="form-group">
          <label className="form-label">Decimal places</label>
          <select
            className="form-input"
            value={decimals}
            onChange={(e) => setDecimals(Number(e.target.value))}
          >
            <option value={0}>0 (whole number)</option>
            <option value={1}>1 (tenths)</option>
            <option value={2}>2 (hundredths)</option>
            <option value={3}>3 (thousandths)</option>
            <option value={4}>4 (ten-thousandths)</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
          </select>
        </div>
      )}

      {/* Multiple */}
      {mode === "multiple" && (
        <div className="form-group">
          <label className="form-label">Multiple</label>
          <input
            className="form-input"
            value={multiple}
            onChange={(e) => setMultiple(e.target.value)}
            placeholder="e.g. 5, 0.25, 10"
          />
        </div>
      )}

      {/* Result */}
      <div className="glass rounded-lg p-4 text-lg font-mono">
        <div className="flex items-center justify-between">
          <span className="flex-1">
            {result === "" || Number.isNaN(result)
              ? "—"
              : result}
          </span>
          <CopyButton value={result === "" || Number.isNaN(result) ? "—" : String(result)} />
        </div>
      </div>
    </div>
  )
}
