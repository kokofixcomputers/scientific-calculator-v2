import { useState } from "react"
import CopyButton from "../../components/CopyButton"
import {
  parseSentence,
} from "./calc"

export default function OneStepEquation() {
  const [sentences, setSentences] = useState<string[]>([""])
  const [result, setResult] = useState<string>("—")

  function updateSentence(index: number, value: string) {
    const newSentences = [...sentences]
    newSentences[index] = value
    setSentences(newSentences)
  }

  function calculate() {
    const validSentences = sentences.filter(s => s.trim() !== "")

    if (validSentences.length === 0) return

    const calculatedResult = parseSentence(validSentences[0])
    setResult(String(calculatedResult))
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>One Step Equation</h2>
        <span className="badge-secondary ui-blue">Sentence to Equation</span>
      </div>

      <div className="space-y-3">
          <div key={0} className="flex gap-2">
            <input
              className="form-input flex-1"
              value={sentences[0]}
              onChange={(e) => updateSentence(0, e.target.value)}
              placeholder={`Sentence ${0 + 1}`}
              type="text"
            />
          </div>
      </div>

      <div className="flex gap-3">
        <button className="btn-accent" onClick={calculate}>
          Calculate
        </button>
      </div>

      <div className="glass rounded-lg p-4 font-mono text-lg">
        <div className="flex items-center justify-between">
          <span className="flex-1">{result}</span>
          <CopyButton value={result} />
        </div>
      </div>
    </div>
  )
}
