import { useState, useEffect, useRef } from "react"
import CopyButton from "../../components/CopyButton"
import Keypad from "./Keypad"
import FractionDisplay from "../../components/FractionDisplay"
import {
  createInitialState,
  inputDigit,
  inputDecimal,
  inputFraction,
  inputParenthesis,
  inputCustomRoot,
  inputPi,
  setOperator,
  calculate,
  clear,
  sqrt,
  cbrt,
  square,
  backspace,
  toggleFractionMode,
} from "./calc"

export default function Calculator() {
  const [state, setState] = useState(createInitialState())
  const [scientific, setScientific] = useState(false)
  const displayRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const copyButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key
      
      // Prevent default for calculator keys
      if (/[0-9+\-*/.=()]/.test(key) || key === 'Enter' || key === 'Backspace' || key === 'Escape') {
        event.preventDefault()
      }
      
      // Numbers
      if (/[0-9]/.test(key)) {
        setState(s => inputDigit(s, key))
      }
      // Operators
      else if (key === '+') {
        setState(s => setOperator(s, '+'))
      }
      else if (key === '-') {
        setState(s => setOperator(s, '-'))
      }
      else if (key === '*' || key === 'x' || key === 'X') {
        setState(s => setOperator(s, '*'))
      }
      else if (key === '/') {
        setState(s => setOperator(s, '/'))
      }
      else if (key === '^') {
        setState(s => setOperator(s, '^'))
      }
      // Special keys
      else if (key === '.' || key === ',') {
        setState(s => inputDecimal(s))
      }
      else if (key === '(' || key === ')') {
        setState(s => inputParenthesis(s, key))
      }
      else if (key === '=' || key === 'Enter') {
        setState(s => calculate(s))
      }
      else if (key === 'Backspace') {
        setState(s => backspace(s))
      }
      else if (key === 'Escape' || key === 'c' || key === 'C') {
        setState(clear())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (displayRef.current && containerRef.current && copyButtonRef.current) {
      const display = displayRef.current
      const container = containerRef.current
      const copyButton = copyButtonRef.current
      const containerWidth = container.offsetWidth
      const copyButtonWidth = copyButton.offsetWidth
      const availableWidth = containerWidth - copyButtonWidth - 20 // 20px for margin
      const maxFontSize = 56 // Maximum font size in pixels
      const minFontSize = 24 // Minimum font size in pixels
      
      // Reset font size to default
      display.style.fontSize = ""
      
      // Calculate the required font size
      const textWidth = display.scrollWidth
      const requiredFontSize = (availableWidth / textWidth) * maxFontSize
      
      // Apply the calculated font size with constraints
      const newFontSize = Math.min(
        Math.max(requiredFontSize, minFontSize),
        maxFontSize
      )
      
      display.style.fontSize = `${newFontSize}px`
    }
  }, [state.current])

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2>Calculator</h2>
          <span className="badge-secondary ui-blue">Basic & Scientific</span>
        </div>
        <div className="flex gap-2">
          <button
            className={`btn-secondary text-xs ${state.showFraction ? "bg-black/5 dark:bg-white/10" : ""}`}
            onClick={() => setState(s => toggleFractionMode(s))}
          >
            a/b
          </button>
          <button
            className={`btn-secondary ${scientific ? "bg-black/5 dark:bg-white/10" : ""}`}
            onClick={() => setScientific(!scientific)}
          >
            {scientific ? "Basic" : "Scientific"}
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="text-sm text-[rgb(var(--muted))] min-h-[1.25rem]">
          {state.previous || state.expression}
        </div>
        <div className="flex items-center justify-between" ref={containerRef}>
          <div className="flex-1 overflow-hidden whitespace-nowrap" ref={displayRef} style={{ fontSize: "56px" }}>
            {state.showFraction && state.current.includes("/") ? (
              <FractionDisplay result={state.current} />
            ) : (
              state.current
            )}
          </div>
          <CopyButton value={state.current} className="ml-2" />
        </div>
      </div>

      <Keypad
        scientific={scientific}
        onDigit={(d) => setState(s => inputDigit(s, d))}
        onDecimal={() => setState(s => inputDecimal(s))}
        onFraction={() => setState(s => inputFraction(s))}
        onParenthesis={(p) => setState(s => inputParenthesis(s, p))}
        onCustomRoot={() => setState(s => inputCustomRoot(s))}
        onPi={() => setState(s => inputPi(s))}
        onOperator={(o) => setState(s => setOperator(s, o))}
        onPower={() => setState(s => setOperator(s, "^"))}
        onEquals={() => setState(s => calculate(s))}
        onClear={() => setState(clear())}
        onBackspace={() => setState(s => backspace(s))}
        onSqrt={() => setState(s => ({ ...s, current: sqrt(s.current) }))}
        onCbrt={() => setState(s => ({ ...s, current: cbrt(s.current) }))}
        onSquare={() => setState(s => ({ ...s, current: square(s.current) }))}
      />

    </div>
  )
}
