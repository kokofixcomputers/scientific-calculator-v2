import { useState, useEffect } from "react"
import Display from "./Display"
import Keypad from "./Keypad"
import FractionDisplay from "../../components/FractionDisplay"
import {
  createInitialState,
  inputDigit,
  inputDecimal,
  inputFraction,
  inputParenthesis,
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

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between">
        <h2>Calculator</h2>
        <div className="flex gap-2">
          <button
            className={`btn-secondary text-xs ${
              state.showFraction ? "bg-blue-100 dark:bg-blue-900" : ""
            }`}
            onClick={() => setState(s => toggleFractionMode(s))}
          >
            a/b
          </button>
          <button
            className="btn-secondary"
            onClick={() => setScientific(!scientific)}
          >
            {scientific ? "Basic" : "Scientific"}
          </button>
        </div>
      </div>

      <div className="glass rounded-lg p-4">
        <div className="text-sm text-[rgb(var(--muted))] mb-2 min-h-[1.25rem]">
          {state.previous || state.expression}
        </div>
        <div className="text-2xl font-mono">
          {state.showFraction && state.current.includes("/") ? (
            <FractionDisplay result={state.current} />
          ) : (
            state.current
          )}
        </div>
      </div>

      <Keypad
        scientific={scientific}
        onDigit={(d) => setState(s => inputDigit(s, d))}
        onDecimal={() => setState(s => inputDecimal(s))}
        onFraction={() => setState(s => inputFraction(s))}
        onParenthesis={(p) => setState(s => inputParenthesis(s, p))}
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
