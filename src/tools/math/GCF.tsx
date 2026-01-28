import { useState } from "react"
import CopyButton from "../../components/CopyButton"
import { Plus, X } from "lucide-react"
import { gcfMultiple } from "./calc"

export default function GCF() {
  const [numbers, setNumbers] = useState<string[]>(["", ""])
  const [result, setResult] = useState<string>("—")

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
    
    const gcf = gcfMultiple(validNumbers)
    setResult(String(gcf))
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>GCF Calculator</h2>
        <span className="badge-secondary ui-teal">Multiple Numbers</span>
      </div>

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
          Calculate GCF
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