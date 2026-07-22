import { useState, useEffect } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import { Plus, X } from "lucide-react"
import { lcmMultiple, gcfMultiple } from "./calc"
import { useToolContext } from "../../contexts/ToolContext"

export default function LcmGcf() {
  const [mode, setMode] = useState<"lcm" | "gcf">("lcm")
  const [numbers, setNumbers] = useState<string[]>(["", ""])
  const [result, setResult] = useState<string>("—")
  const { consumePendingValue } = useToolContext()

  useEffect(() => {
    const pending = consumePendingValue()
    if (pending) setNumbers([pending, ""])
  }, [])

  function addNumber() {
    setNumbers([...numbers, ""])
  }

  function removeNumber(index: number) {
    if (numbers.length > 2) {
      setNumbers(numbers.filter((_, i) => i !== index))
    }
  }

  function updateNumber(index: number, value: string) {
    const newNumbers = [...numbers]
    newNumbers[index] = value
    setNumbers(newNumbers)
  }

  function calculate() {
    const validNumbers = numbers
      .map(n => parseInt(n))
      .filter(n => !isNaN(n) && n > 0)

    if (validNumbers.length < 2) return

    const value = mode === "lcm" ? lcmMultiple(validNumbers) : gcfMultiple(validNumbers)
    setResult(String(value))
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>LCM / GCF Calculator</h2>
        <span className="badge-secondary ui-orange">Multiple Numbers</span>
      </div>

      <select className="form-input" value={mode} onChange={e => setMode(e.target.value as "lcm" | "gcf")}>
        <option value="lcm">Least Common Multiple (LCM)</option>
        <option value="gcf">Greatest Common Factor (GCF)</option>
      </select>

      <div className="space-y-3">
        {numbers.map((num, index) => (
          <div key={index} className="flex gap-2">
            <input
              className="form-input flex-1"
              value={num}
              onChange={(e) => updateNumber(index, e.target.value)}
              placeholder={`Number ${index + 1}`}
              type="number"
            />
            {numbers.length > 2 && (
              <button
                className="btn-danger px-3"
                onClick={() => removeNumber(index)}
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button className="btn-secondary" onClick={addNumber}>
          <Plus size={16} className="mr-2" />
          Add Number
        </button>
        <button className="btn-accent" onClick={calculate}>
          Calculate {mode.toUpperCase()}
        </button>
      </div>

      <ResultDisplay value={result} />
    </div>
  )
}
