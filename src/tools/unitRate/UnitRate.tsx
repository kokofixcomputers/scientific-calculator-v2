import { useState } from "react"
import CopyButton from "../../components/CopyButton"
import ResultDisplay from "../../components/ResultDisplay"
import { computeUnitRate, generateRateTable } from "./calc"

export default function UnitRate() {
  const [mode, setMode] = useState<"rate" | "table">("rate")

  const [qty1, setQty1] = useState("")
  const [unit1, setUnit1] = useState("miles")
  const [qty2, setQty2] = useState("")
  const [unit2, setUnit2] = useState("hour")

  const [result, setResult] = useState<string>("—")
  const [fraction, setFraction] = useState<string>("")

  const [tableRows, setTableRows] = useState<{ multiplier: number; quantity1: number; quantity2: number }[] | null>(null)
  const [tableError, setTableError] = useState<string>("")

  function calculateRate() {
    const r = computeUnitRate(qty1, qty2)
    if (!r) {
      setResult("Invalid input")
      setFraction("")
      return
    }
    const decimalStr = Number.isInteger(r.decimal) ? String(r.decimal) : r.decimal.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")
    setResult(`${decimalStr} ${unit1 || "unit"} per ${unit2 || "unit"}`)
    setFraction(r.fraction === decimalStr ? "" : r.fraction)
  }

  function calculateTable() {
    const r = computeUnitRate(qty1, qty2)
    if (!r) {
      setTableError("Invalid input")
      setTableRows(null)
      return
    }
    setTableError("")
    setTableRows(generateRateTable(r.decimal))
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Unit Rate Calculator</h2>
        <span className="badge-secondary ui-blue">Supports Fractions</span>
      </div>

      <select className="form-input" value={mode} onChange={e => setMode(e.target.value as any)}>
        <option value="rate">Find Unit Rate</option>
        <option value="table">Rate Table</option>
      </select>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            className="form-input"
            value={qty1}
            onChange={e => setQty1(e.target.value)}
            placeholder="Quantity (e.g., 3 1/2)"
          />
          <input
            className="form-input"
            value={unit1}
            onChange={e => setUnit1(e.target.value)}
            placeholder="Unit (e.g., miles)"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            className="form-input"
            value={qty2}
            onChange={e => setQty2(e.target.value)}
            placeholder="Per quantity (e.g., 3/5)"
          />
          <input
            className="form-input"
            value={unit2}
            onChange={e => setUnit2(e.target.value)}
            placeholder="Unit (e.g., hour)"
          />
        </div>
        <p className="text-sm opacity-70">
          Values can be whole numbers, decimals, fractions ("3/5"), or mixed numbers ("3 1/2").
        </p>
      </div>

      {mode === "rate" && (
        <>
          <button className="btn-primary w-full" onClick={calculateRate}>
            Calculate
          </button>

          <ResultDisplay value={result} />
          {fraction && (
            <div className="text-center text-sm opacity-70">
              Exact value: {fraction} {unit1 || "unit"} per {unit2 || "unit"}
            </div>
          )}
          <CopyButton value={result} />
        </>
      )}

      {mode === "table" && (
        <>
          <button className="btn-primary w-full" onClick={calculateTable}>
            Generate Table
          </button>

          {tableError && <ResultDisplay value={tableError} />}

          {tableRows && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-2">{unit2 || "Unit 2"}</th>
                    <th className="text-left py-2 px-2">{unit1 || "Unit 1"}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map(row => (
                    <tr key={row.multiplier} className="border-t border-black/10 dark:border-white/10">
                      <td className="py-2 px-2">{row.quantity2}</td>
                      <td className="py-2 px-2">
                        {Number.isInteger(row.quantity1) ? row.quantity1 : row.quantity1.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
