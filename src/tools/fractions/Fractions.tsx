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
  whatFractionOf,
  fractionOfNumber,
  findWholeFromFraction,
} from "./calc"

export default function Fractions() {
  const [mode, setMode] = useState<"convert" | "word">("convert")
  const [input, setInput] = useState("")
  const [result, setResult] = useState<string>("—")

  const [wordProblem, setWordProblem] = useState<"whatFraction" | "fractionOf" | "findWhole">("whatFraction")
  const [part, setPart] = useState("")
  const [whole, setWhole] = useState("")
  const [numerator, setNumerator] = useState("")
  const [denominator, setDenominator] = useState("")
  const [ofNumber, setOfNumber] = useState("")
  const [wordResult, setWordResult] = useState<string>("—")

  function calculateWordProblem() {
    if (wordProblem === "whatFraction") {
      const p = Number(part)
      const w = Number(whole)
      if (isNaN(p) || isNaN(w) || w === 0) return
      const [n, d] = whatFractionOf(p, w)
      setWordResult(`${n}/${d}`)
    } else if (wordProblem === "fractionOf") {
      const n = Number(numerator)
      const d = Number(denominator)
      const w = Number(ofNumber)
      if (isNaN(n) || isNaN(d) || isNaN(w) || d === 0) return
      setWordResult(String(fractionOfNumber(n, d, w)))
    } else {
      const p = Number(part)
      const n = Number(numerator)
      const d = Number(denominator)
      if (isNaN(p) || isNaN(n) || isNaN(d) || n === 0) return
      setWordResult(String(findWholeFromFraction(p, n, d)))
    }
  }

  function parseFraction() {
    // Handle mixed numbers (e.g., "2 3/4")
    if (input.includes(" ") && input.includes("/")) {
      const parts = input.split(" ")
      const whole = Number(parts[0])
      const [n, d] = parts[1].split("/").map(Number)
      const [ni, di] = toImproperFraction(whole, n, d)
      return [ni, di]
    }
    // Handle regular fractions (e.g., "3/4")
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

      <div className="grid grid-cols-2 gap-3">
        <button
          className={mode === "convert" ? "btn-accent" : "btn-secondary"}
          onClick={() => setMode("convert")}
        >
          Convert
        </button>
        <button
          className={mode === "word" ? "btn-accent" : "btn-secondary"}
          onClick={() => setMode("word")}
        >
          Word Problems
        </button>
      </div>

      {mode === "convert" && (
        <>
          <input
            className="form-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 0.75, 3/4, 2 1/2, 156%"
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
        </>
      )}

      {mode === "word" && (
        <>
          <select
            className="form-input"
            value={wordProblem}
            onChange={(e) => setWordProblem(e.target.value as "whatFraction" | "fractionOf" | "findWhole")}
          >
            <option value="whatFraction">X is what fraction of Y?</option>
            <option value="fractionOf">What is a/b of N?</option>
            <option value="findWhole">X is a/b of what number?</option>
          </select>

          {wordProblem === "whatFraction" && (
            <div className="flex items-center gap-3">
              <input
                className="form-input"
                value={part}
                onChange={(e) => setPart(e.target.value)}
                placeholder="e.g. 12"
              />
              <span className="opacity-60 whitespace-nowrap">is what fraction of</span>
              <input
                className="form-input"
                value={whole}
                onChange={(e) => setWhole(e.target.value)}
                placeholder="e.g. 18"
              />
            </div>
          )}

          {wordProblem === "fractionOf" && (
            <div className="flex items-center gap-3">
              <span className="opacity-60 whitespace-nowrap">What is</span>
              <input
                className="form-input w-20"
                value={numerator}
                onChange={(e) => setNumerator(e.target.value)}
                placeholder="3"
              />
              <span className="opacity-60">/</span>
              <input
                className="form-input w-20"
                value={denominator}
                onChange={(e) => setDenominator(e.target.value)}
                placeholder="7"
              />
              <span className="opacity-60 whitespace-nowrap">of</span>
              <input
                className="form-input"
                value={ofNumber}
                onChange={(e) => setOfNumber(e.target.value)}
                placeholder="56"
              />
            </div>
          )}

          {wordProblem === "findWhole" && (
            <div className="flex items-center gap-3">
              <input
                className="form-input"
                value={part}
                onChange={(e) => setPart(e.target.value)}
                placeholder="e.g. 14"
              />
              <span className="opacity-60 whitespace-nowrap">is</span>
              <input
                className="form-input w-20"
                value={numerator}
                onChange={(e) => setNumerator(e.target.value)}
                placeholder="7"
              />
              <span className="opacity-60">/</span>
              <input
                className="form-input w-20"
                value={denominator}
                onChange={(e) => setDenominator(e.target.value)}
                placeholder="12"
              />
              <span className="opacity-60 whitespace-nowrap">of what number?</span>
            </div>
          )}

          <button className="btn-accent w-full" onClick={calculateWordProblem}>
            Calculate
          </button>

          <div className="glass rounded-lg p-4 font-mono text-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">{wordResult}</div>
              <CopyButton value={wordResult} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
