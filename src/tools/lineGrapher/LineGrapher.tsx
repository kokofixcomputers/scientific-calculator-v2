import { useState, useEffect } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import {
  analyzeLine,
  lineFromSlopeIntercept,
  lineFromTwoPoints,
  lineFromPointSlope,
  findParallelAndPerpendicularSlope,
  type LineInfo,
} from "./calc"
import { useToolContext } from "../../contexts/ToolContext"

const WIDTH = 640
const HEIGHT = 480
const MARGIN = 30
const RANGE = 10 // shows x and y from -RANGE to +RANGE

function scaleX(x: number): number {
  return MARGIN + ((x + RANGE) / (2 * RANGE)) * (WIDTH - 2 * MARGIN)
}

function scaleY(y: number): number {
  return HEIGHT - MARGIN - ((y + RANGE) / (2 * RANGE)) * (HEIGHT - 2 * MARGIN)
}

function CartesianGraph({ line }: { line: LineInfo }) {
  const ticks: number[] = []
  for (let v = -RANGE; v <= RANGE; v += 2) ticks.push(v)

  let x1: number, y1: number, x2: number, y2: number
  if (line.isVertical) {
    x1 = x2 = line.verticalX!
    y1 = -RANGE
    y2 = RANGE
  } else {
    x1 = -RANGE
    x2 = RANGE
    y1 = line.slope! * x1 + line.yIntercept!
    y2 = line.slope! * x2 + line.yIntercept!
  }

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full text-blue-600 dark:text-blue-400">
      {/* gridlines */}
      {ticks.map(t => (
        <g key={`grid-${t}`}>
          <line x1={scaleX(t)} y1={MARGIN} x2={scaleX(t)} y2={HEIGHT - MARGIN} stroke="currentColor" strokeOpacity={0.1} strokeWidth={1} />
          <line x1={MARGIN} y1={scaleY(t)} x2={WIDTH - MARGIN} y2={scaleY(t)} stroke="currentColor" strokeOpacity={0.1} strokeWidth={1} />
        </g>
      ))}

      {/* axes */}
      <line x1={MARGIN} y1={scaleY(0)} x2={WIDTH - MARGIN} y2={scaleY(0)} stroke="currentColor" strokeOpacity={0.4} strokeWidth={1.5} />
      <line x1={scaleX(0)} y1={MARGIN} x2={scaleX(0)} y2={HEIGHT - MARGIN} stroke="currentColor" strokeOpacity={0.4} strokeWidth={1.5} />

      {/* axis labels */}
      {ticks.filter(t => t !== 0).map(t => (
        <g key={`label-${t}`}>
          <text x={scaleX(t)} y={scaleY(0) + 16} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.6}>{t}</text>
          <text x={scaleX(0) - 10} y={scaleY(t) + 4} textAnchor="end" fontSize={11} fill="currentColor" opacity={0.6}>{t}</text>
        </g>
      ))}

      {/* the line itself */}
      <line x1={scaleX(x1)} y1={scaleY(y1)} x2={scaleX(x2)} y2={scaleY(y2)} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />

      {/* intercept markers */}
      {line.yIntercept !== null && Math.abs(line.yIntercept) <= RANGE && (
        <circle cx={scaleX(0)} cy={scaleY(line.yIntercept)} r={5} fill="currentColor" />
      )}
      {line.xIntercept !== null && Math.abs(line.xIntercept) <= RANGE && (
        <circle cx={scaleX(line.xIntercept)} cy={scaleY(0)} r={5} fill="currentColor" />
      )}
    </svg>
  )
}

// Number() can't parse fractions like "-1/2", so inputs here would silently fail as NaN.
// This accepts plain numbers as well as "a/b" fractions.
function parseNum(input: string): number {
  const trimmed = input.trim()
  if (trimmed === "") return NaN
  const fracMatch = trimmed.match(/^(-?\d+\.?\d*)\/(-?\d+\.?\d*)$/)
  if (fracMatch) {
    const num = Number(fracMatch[1])
    const den = Number(fracMatch[2])
    if (isNaN(num) || isNaN(den) || den === 0) return NaN
    return num / den
  }
  return Number(trimmed)
}

function summarize(line: LineInfo): string {
  return line.isVertical
    ? `${line.equation}  |  slope: undefined  |  no y-intercept`
    : `${line.equation}  |  slope: ${line.slope}  |  y-intercept: ${line.yIntercept}`
}

type Mode = "equation" | "slopeIntercept" | "twoPoints" | "pointSlope" | "parallelPerp"

export default function LineGrapher() {
  const [mode, setMode] = useState<Mode>("equation")
  const [result, setResult] = useState<string>("—")
  const [line, setLine] = useState<LineInfo | null>(null)
  const { consumePendingValue } = useToolContext()

  // Analyze an Equation
  const [input, setInput] = useState("")

  // Build from Slope & Y-Intercept
  const [m, setM] = useState("")
  const [b, setB] = useState("")

  // Build from Two Points
  const [x1, setX1] = useState("")
  const [y1, setY1] = useState("")
  const [x2, setX2] = useState("")
  const [y2, setY2] = useState("")

  // Build from a Point & Slope
  const [px, setPx] = useState("")
  const [py, setPy] = useState("")
  const [pointSlope, setPointSlope] = useState("")

  // Parallel & Perpendicular Slope Finder
  const [slopeIn, setSlopeIn] = useState("")
  const [slopeIsVertical, setSlopeIsVertical] = useState(false)

  useEffect(() => {
    const pending = consumePendingValue()
    if (pending) setInput(pending)
  }, [])

  function showLine(analysis: LineInfo | { error: string }) {
    if ("error" in analysis) {
      setResult(analysis.error)
      setLine(null)
      return
    }
    setLine(analysis)
    setResult(summarize(analysis))
  }

  function calculate() {
    switch (mode) {
      case "equation": {
        if (!input.trim()) return
        showLine(analyzeLine(input))
        break
      }
      case "slopeIntercept": {
        const numM = parseNum(m)
        const numB = parseNum(b)
        if (isNaN(numM) || isNaN(numB)) {
          setResult("Enter a valid number or fraction for both m and b")
          setLine(null)
          return
        }
        showLine(lineFromSlopeIntercept(numM, numB))
        break
      }
      case "twoPoints": {
        const nx1 = parseNum(x1), ny1 = parseNum(y1), nx2 = parseNum(x2), ny2 = parseNum(y2)
        if (isNaN(nx1) || isNaN(ny1) || isNaN(nx2) || isNaN(ny2)) {
          setResult("Enter valid numbers for both points")
          setLine(null)
          return
        }
        showLine(lineFromTwoPoints(nx1, ny1, nx2, ny2))
        break
      }
      case "pointSlope": {
        const npx = parseNum(px)
        const npy = parseNum(py)
        const nSlope = parseNum(pointSlope)
        if (isNaN(npx) || isNaN(npy) || isNaN(nSlope)) {
          setResult("Enter valid numbers for the point and slope")
          setLine(null)
          return
        }
        showLine(lineFromPointSlope(npx, npy, nSlope))
        break
      }
      case "parallelPerp": {
        const nSlope = slopeIsVertical ? null : parseNum(slopeIn)
        if (nSlope !== null && isNaN(nSlope)) {
          setResult("Enter a valid number or fraction for the slope")
          setLine(null)
          return
        }
        const { parallelSlope, perpendicularSlope } = findParallelAndPerpendicularSlope(nSlope)
        setResult(
          `Parallel slope: ${parallelSlope === null ? "undefined (vertical)" : parallelSlope}  |  ` +
          `Perpendicular slope: ${perpendicularSlope === null ? "undefined (vertical)" : perpendicularSlope}`
        )
        setLine(null)
        break
      }
    }
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Line &amp; Slope Tool</h2>
        <span className="badge-secondary ui-blue">Slope, Intercepts &amp; Graph</span>
      </div>

      <select className="form-input" value={mode} onChange={e => setMode(e.target.value as Mode)}>
        <option value="equation">Analyze an Equation</option>
        <option value="slopeIntercept">Build from Slope (m) &amp; Y-Intercept (b)</option>
        <option value="twoPoints">Build from Two Points</option>
        <option value="pointSlope">Build from a Point &amp; Slope</option>
        <option value="parallelPerp">Parallel &amp; Perpendicular Slope Finder</option>
      </select>

      {mode === "equation" && (
        <input
          className="form-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. y = -x + 1, 2x + 3y = 6, x = 4"
          onKeyDown={(e) => e.key === "Enter" && calculate()}
        />
      )}

      {mode === "slopeIntercept" && (
        <div className="flex items-center gap-2">
          <span className="opacity-60 whitespace-nowrap">y =</span>
          <input className="form-input" value={m} onChange={e => setM(e.target.value)} placeholder="m (e.g., 3)" />
          <span className="opacity-60">x +</span>
          <input className="form-input" value={b} onChange={e => setB(e.target.value)} placeholder="b (e.g., -2)" />
        </div>
      )}

      {mode === "twoPoints" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm opacity-60">Point 1</p>
            <div className="flex items-center gap-2">
              <input className="form-input" value={x1} onChange={e => setX1(e.target.value)} placeholder="x1" />
              <input className="form-input" value={y1} onChange={e => setY1(e.target.value)} placeholder="y1" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm opacity-60">Point 2</p>
            <div className="flex items-center gap-2">
              <input className="form-input" value={x2} onChange={e => setX2(e.target.value)} placeholder="x2" />
              <input className="form-input" value={y2} onChange={e => setY2(e.target.value)} placeholder="y2" />
            </div>
          </div>
        </div>
      )}

      {mode === "pointSlope" && (
        <div className="space-y-2">
          <p className="text-sm opacity-60">Point</p>
          <div className="flex items-center gap-2">
            <input className="form-input" value={px} onChange={e => setPx(e.target.value)} placeholder="x" />
            <input className="form-input" value={py} onChange={e => setPy(e.target.value)} placeholder="y" />
            <span className="opacity-60 whitespace-nowrap">slope</span>
            <input className="form-input" value={pointSlope} onChange={e => setPointSlope(e.target.value)} placeholder="m (e.g., 4)" />
          </div>
        </div>
      )}

      {mode === "parallelPerp" && (
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={slopeIsVertical} onChange={e => setSlopeIsVertical(e.target.checked)} />
            <span className="text-sm">Line is vertical (undefined slope)</span>
          </label>
          {!slopeIsVertical && (
            <input
              className="form-input"
              value={slopeIn}
              onChange={e => setSlopeIn(e.target.value)}
              placeholder="Slope (e.g., 2)"
            />
          )}
        </div>
      )}

      <button className="btn-accent w-full" onClick={calculate}>
        {mode === "parallelPerp" ? "Find Slopes" : "Build & Graph"}
      </button>

      <ResultDisplay value={result} />

      {line && (
        <div className="glass rounded-lg p-4">
          <CartesianGraph line={line} />
        </div>
      )}
    </div>
  )
}
