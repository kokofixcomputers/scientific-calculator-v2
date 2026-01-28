import { useState } from "react"
import CopyButton from "../../components/CopyButton"
import FractionDisplay from "../../components/FractionDisplay"
import {
  decimalToFraction,
  simplifyFraction,
  toMixedNumber,
  toImproperFraction,
  fractionToDecimal,
  fractionToPercent,
} from "./calc"

export default function Fractions() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<string>("—")

  function parseFraction() {
    if (input.includes("/")) {
      const [n, d] = input.split("/").map(Number)
      return [n, d]
    }
    return null
  }

  function handleDecimalToFraction() {
    const v = Number(input)
    if (isNaN(v)) return
    const [n, d] = decimalToFraction(v)
    setResult(`${n}/${d}`)
  }

  function handleSimplify() {
    const frac = parseFraction()
    if (!frac) return
    const [n, d] = simplifyFraction(frac[0], frac[1])
    setResult(`${n}/${d}`)
  }

  function handleMixed() {
    const frac = parseFraction()
    if (!frac) return
    const [w, n, d] = toMixedNumber(frac[0], frac[1])
    setResult(`${w} ${n}/${d}`)
  }

  function handleImproper() {
    const parts = input.split(" ")
    if (parts.length !== 2) return
    const whole = Number(parts[0])
    const [n, d] = parts[1].split("/").map(Number)
    const [ni, di] = toImproperFraction(whole, n, d)
    setResult(`${ni}/${di}`)
  }

  function handleDecimal() {
    const frac = parseFraction()
    if (!frac) return
    setResult(String(fractionToDecimal(frac[0], frac[1])))
  }

  function handlePercent() {
    const frac = parseFraction()
    if (!frac) return
    setResult(`${fractionToPercent(frac[0], frac[1])}%`)
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Fractions</h2>
        <span className="badge-secondary ui-pink">Visual Display</span>
      </div>

      <input
        className="form-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. 0.75, 3/4, 2 1/2"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button className="btn-accent" onClick={handleDecimalToFraction}>
          To Fraction
        </button>
        <button className="btn-green" onClick={handleSimplify}>
          Simplify
        </button>
        <button className="btn-purple" onClick={handleMixed}>
          To Mixed
        </button>
        <button className="btn-danger" onClick={handleImproper}>
          To Improper
        </button>
        <button className="btn-orange" onClick={handlePercent}>
          To Percent
        </button>
        <button className="btn-teal" onClick={handleDecimal}>
          To Decimal
        </button>
      </div>

      <div className="glass rounded-lg p-4 font-mono text-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <FractionDisplay result={result} />
          </div>
          <CopyButton value={result} />
        </div>
      </div>
    </div>
  )
}
