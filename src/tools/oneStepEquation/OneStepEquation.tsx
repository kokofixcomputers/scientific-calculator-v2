import { useState, useEffect } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import {
  parseSentence,
} from "./calc"
import { useToolContext } from "../../contexts/ToolContext"

export default function OneStepEquation() {
  const [sentences, setSentences] = useState<string[]>([""])
  const [result, setResult] = useState<string>("—")
  const { consumePendingValue } = useToolContext()

  useEffect(() => {
    const pending = consumePendingValue()
    if (pending) setSentences([pending])
  }, [])

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

      <ResultDisplay value={result} />
    </div>
  )
}
