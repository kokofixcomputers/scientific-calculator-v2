import { useState } from "react"
import CopyButton from "../../components/CopyButton"

export default function TimeCalculator() {
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [result, setResult] = useState<string>("—")

  function calculateDifference() {
    if (!startDate || !startTime || !endDate || !endTime) return

    const start = new Date(`${startDate}T${startTime}:00`)
    const end = new Date(`${endDate}T${endTime}:00`)
    
    const diff = end.getTime() - start.getTime()
    
    if (diff < 0) {
      setResult("End must be after start")
      return
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    let resultParts = []
    if (days > 0) resultParts.push(`${days}d`)
    if (hours > 0) resultParts.push(`${hours}h`)
    if (minutes > 0) resultParts.push(`${minutes}m`)
    if (seconds > 0) resultParts.push(`${seconds}s`)
    
    setResult(resultParts.join(" ") || "0s")
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Date & Time Calculator</h2>
        <span className="badge-secondary ui-gray">Duration & Difference</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Start</h3>
          <div>
            <label className="form-label">Date</label>
            <input
              className="form-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Time</label>
            <input
              className="form-input"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">End</h3>
          <div>
            <label className="form-label">Date</label>
            <input
              className="form-input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Time</label>
            <input
              className="form-input"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
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