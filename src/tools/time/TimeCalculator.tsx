import { useState } from "react"
import CopyButton from "../../components/CopyButton"

export default function TimeCalculator() {
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [result, setResult] = useState<string>("—")

  function calculateDifference() {
    if (!startTime || !endTime) return

    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    
    let diff = end.getTime() - start.getTime()
    
    // Handle next day scenario
    if (diff < 0) {
      diff += 24 * 60 * 60 * 1000
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    setResult(`${hours}h ${minutes}m ${seconds}s`)
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Time Calculator</h2>
        <span className="badge-secondary ui-gray">Duration & Difference</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="form-label">Start Time</label>
          <input
            className="form-input"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div>
          <label className="form-label">End Time</label>
          <input
            className="form-input"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      <button className="btn-accent" onClick={calculateDifference}>
        Calculate Difference
      </button>

      <div className="glass rounded-lg p-4 font-mono text-lg">
        <div className="flex items-center justify-between">
          <span className="flex-1">{result}</span>
          <CopyButton value={result} />
        </div>
      </div>
    </div>
  )
}