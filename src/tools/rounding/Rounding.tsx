import { useState, useEffect } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import {
  roundToPlace,
  roundToDecimals,
  roundToMultiple,
  parseFractionOrMixed,
  decimalToFraction,
  decimalToMixedNumber,
  type RoundingMode,
} from "./calc"
import { useToolContext } from "../../contexts/ToolContext"

export default function Rounding() {
  const [value, setValue] = useState("")
  const [mode, setMode] = useState<RoundingMode>("place")
  const [place, setPlace] = useState(1)
  const [decimals, setDecimals] = useState(0)
  const [multiple, setMultiple] = useState("")
  const [outputFormat, setOutputFormat] = useState<"decimal" | "fraction" | "mixed">("decimal")
  const { consumePendingValue } = useToolContext()

  useEffect(() => {
    const pending = consumePendingValue()
    if (pending) setValue(pending)
  }, [])

  // Parse input - supports fractions, mixed numbers, and decimals
  const parsedValue = parseFractionOrMixed(value)

  let result: number | string = ""

  if (parsedValue !== null) {
    let roundedValue: number
    if (mode === "place") {
      roundedValue = roundToPlace(parsedValue, place)
    } else if (mode === "decimal") {
      roundedValue = roundToDecimals(parsedValue, decimals)
    } else {
      const m = Number(multiple)
      roundedValue =
        multiple === "" || isNaN(m)
          ? NaN
          : roundToMultiple(parsedValue, m)
    }

    if (!isNaN(roundedValue)) {
      if (outputFormat === "decimal") {
        result = roundedValue
      } else if (outputFormat === "fraction") {
        const [n, d] = decimalToFraction(roundedValue)
        result = `${n}/${d}`
      } else {
        const [w, n, d] = decimalToMixedNumber(roundedValue)
        if (n === 0) {
          result = w
        } else {
          result = `${w} ${n}/${d}`
        }
      }
    }
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Rounding</h2>
        <span className="badge-secondary ui-green">Precision Control</span>
      </div>

      {/* Input value */}
      <div className="form-group">
        <label className="form-label">Number</label>
        <input
          className="form-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 2 3/5, 3/4, 5.67"
        />
      </div>

      {/* Output format selector */}
      <div className="form-group">
        <label className="form-label">Output format</label>
        <select
          className="form-input"
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value as any)}
        >
          <option value="decimal">Decimal</option>
          <option value="fraction">Fraction</option>
          <option value="mixed">Mixed Number</option>
        </select>
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

      <ResultDisplay value={result === "" || Number.isNaN(result) ? "—" : String(result)} />
    </div>
  )
}
