import { useState, useEffect } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import { solveInequality } from "./calc"
import { useToolContext } from "../../contexts/ToolContext"

const WIDTH = 640
const HEIGHT = 140
const MARGIN = 40
const AXIS_Y = 70

function buildTicks(boundary: number): { domainMin: number; domainMax: number; ticks: number[] } {
  const center = Math.round(boundary)
  const domainMin = center - 6
  const domainMax = center + 6
  const ticks: number[] = []
  for (let v = domainMin; v <= domainMax; v++) ticks.push(v)
  return { domainMin, domainMax, ticks }
}

function NumberLineGraph({ boundary, inclusive, direction }: { boundary: number; inclusive: boolean; direction: "left" | "right" }) {
  const { domainMin, domainMax, ticks } = buildTicks(boundary)
  const scale = (v: number) => MARGIN + ((v - domainMin) / (domainMax - domainMin)) * (WIDTH - 2 * MARGIN)
  const boundaryX = scale(boundary)
  const rayStart = direction === "left" ? MARGIN : boundaryX
  const rayEnd = direction === "left" ? boundaryX : WIDTH - MARGIN
  const arrowX = direction === "left" ? MARGIN : WIDTH - MARGIN
  const arrowDir = direction === "left" ? -1 : 1

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full text-blue-600 dark:text-blue-400">
      {/* base axis */}
      <line x1={MARGIN} y1={AXIS_Y} x2={WIDTH - MARGIN} y2={AXIS_Y} stroke="currentColor" strokeOpacity={0.3} strokeWidth={2} />

      {/* ticks */}
      {ticks.map(t => (
        <g key={t}>
          <line x1={scale(t)} y1={AXIS_Y - 6} x2={scale(t)} y2={AXIS_Y + 6} stroke="currentColor" strokeOpacity={0.4} strokeWidth={1} />
          <text x={scale(t)} y={AXIS_Y + 24} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.6}>
            {t}
          </text>
        </g>
      ))}

      {/* solution ray */}
      <line x1={rayStart} y1={AXIS_Y} x2={rayEnd} y2={AXIS_Y} stroke="currentColor" strokeWidth={5} strokeLinecap="round" />
      <polygon
        points={`${arrowX},${AXIS_Y} ${arrowX - arrowDir * 10},${AXIS_Y - 6} ${arrowX - arrowDir * 10},${AXIS_Y + 6}`}
        fill="currentColor"
      />

      {/* boundary point */}
      <circle
        cx={boundaryX}
        cy={AXIS_Y}
        r={7}
        fill={inclusive ? "currentColor" : "var(--card-bg, white)"}
        stroke="currentColor"
        strokeWidth={2.5}
      />
    </svg>
  )
}

export default function InequalityGraph() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<string>("—")
  const [graph, setGraph] = useState<{ boundary: number; inclusive: boolean; direction: "left" | "right" } | null>(null)
  const { consumePendingValue } = useToolContext()

  useEffect(() => {
    const pending = consumePendingValue()
    if (pending) setInput(pending)
  }, [])

  function handleSolve() {
    if (!input.trim()) return
    const solution = solveInequality(input)
    setResult(solution.text)
    if (solution.boundary !== undefined && solution.direction && solution.inclusive !== undefined) {
      setGraph({ boundary: solution.boundary, inclusive: solution.inclusive, direction: solution.direction })
    } else {
      setGraph(null)
    }
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Inequality Graph</h2>
        <span className="badge-secondary ui-blue">Single-Variable Inequalities</span>
      </div>

      <input
        className="form-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. 3x + 1 > x + 5"
        onKeyDown={(e) => e.key === "Enter" && handleSolve()}
      />

      <button className="btn-accent w-full" onClick={handleSolve}>
        Solve & Graph
      </button>

      <ResultDisplay value={result} />

      {graph && (
        <div className="glass rounded-lg p-4">
          <NumberLineGraph boundary={graph.boundary} inclusive={graph.inclusive} direction={graph.direction} />
        </div>
      )}
    </div>
  )
}
