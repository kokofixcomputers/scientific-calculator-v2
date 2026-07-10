import { useState, useEffect } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import { simpleInterest, compoundInterest } from "./calc"
import { useToolContext } from "../../contexts/ToolContext"

const compoundingOptions = [
  { label: "Annually", value: 1 },
  { label: "Semiannually", value: 2 },
  { label: "Quarterly", value: 4 },
  { label: "Monthly", value: 12 },
  { label: "Daily", value: 365 },
]

export default function Interest() {
  const [mode, setMode] = useState<"simple" | "compound">("compound")
  const [principal, setPrincipal] = useState("")
  const [rate, setRate] = useState("")
  const [years, setYears] = useState("")
  const [compoundsPerYear, setCompoundsPerYear] = useState(1)
  const [result, setResult] = useState<string>("—")
  const { consumePendingValue } = useToolContext()

  useEffect(() => {
    const pending = consumePendingValue()
    if (pending) setPrincipal(pending)
  }, [])

  function calculate() {
    const p = Number(principal)
    const r = Number(rate)
    const t = Number(years)

    if (isNaN(p) || isNaN(r) || isNaN(t)) return

    const { totalAmount, interestEarned } =
      mode === "simple"
        ? simpleInterest(p, r, t)
        : compoundInterest(p, r, t, compoundsPerYear)

    setResult(`Total: ${totalAmount.toFixed(2)}  |  Interest Earned: ${interestEarned.toFixed(2)}`)
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Interest Calculator</h2>
        <span className="badge-secondary ui-green">Simple &amp; Compound</span>
      </div>

      <select className="form-input" value={mode} onChange={e => setMode(e.target.value as any)}>
        <option value="simple">Simple Interest</option>
        <option value="compound">Compound Interest</option>
      </select>

      <div className="space-y-4">
        <input
          className="form-input"
          value={principal}
          onChange={e => setPrincipal(e.target.value)}
          placeholder="Principal / starting amount (e.g., 1000)"
        />
        <input
          className="form-input"
          value={rate}
          onChange={e => setRate(e.target.value)}
          placeholder="Annual interest rate % (e.g., 3)"
        />
        <input
          className="form-input"
          value={years}
          onChange={e => setYears(e.target.value)}
          placeholder="Time period in years (e.g., 40)"
        />

        {mode === "compound" && (
          <select
            className="form-input"
            value={compoundsPerYear}
            onChange={e => setCompoundsPerYear(Number(e.target.value))}
          >
            {compoundingOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                Compounded {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <button className="btn-primary w-full" onClick={calculate}>
        Calculate
      </button>

      <ResultDisplay value={result} />
    </div>
  )
}
