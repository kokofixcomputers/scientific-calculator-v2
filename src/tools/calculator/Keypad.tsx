import type { Operator } from "./calc"
import Key from "./Key"

interface Props {
  scientific: boolean
  onDigit: (d: string) => void
  onDecimal: () => void
  onFraction: () => void
  onParenthesis: (p: string) => void
  onOperator: (o: Operator) => void
  onEquals: () => void
  onClear: () => void
  onBackspace: () => void
  onSqrt: () => void
  onCbrt: () => void
  onSquare: () => void
  onPower: () => void
}

export default function Keypad(props: Props) {
  return (
    <div className="grid grid-cols-4 gap-3 select-none">
      {/* Scientific row */}
      {props.scientific && (
        <>
          <Key label="(" onClick={() => props.onParenthesis("(")} />
          <Key label=")" onClick={() => props.onParenthesis(")")} />
          <Key label="√" onClick={props.onSqrt} className="btn-yellow" />
          <Key label="^" onClick={props.onPower} className="btn-yellow" />
          
          <Key label="x²" onClick={props.onSquare} className="btn-yellow" />
          <Key label="∛" onClick={props.onCbrt} className="btn-yellow" />
          <div /> {/* spacer */}
          <div /> {/* spacer */}
        </>
      )}

      {/* Row 1 */}
      <Key label="C" onClick={props.onClear} />
      <Key label="⌫" onClick={props.onBackspace} />
      <Key label="÷" onClick={() => props.onOperator("/")} />
      <Key label="×" onClick={() => props.onOperator("*")} />

      {/* Row 2 */}
      <Key label="7" onClick={() => props.onDigit("7")} />
      <Key label="8" onClick={() => props.onDigit("8")} />
      <Key label="9" onClick={() => props.onDigit("9")} />
      <Key label="−" onClick={() => props.onOperator("-")} />

      {/* Row 3 */}
      <Key label="4" onClick={() => props.onDigit("4")} />
      <Key label="5" onClick={() => props.onDigit("5")} />
      <Key label="6" onClick={() => props.onDigit("6")} />
      <Key label="+" onClick={() => props.onOperator("+")} />

      {/* Row 4 */}
      <Key label="1" onClick={() => props.onDigit("1")} />
      <Key label="2" onClick={() => props.onDigit("2")} />
      <Key label="3" onClick={() => props.onDigit("3")} />
      <Key label="=" onClick={props.onEquals} className="btn-equals" />

      {/* Row 5 */}
      <Key label="0" wide onClick={() => props.onDigit("0")} />
      <Key label="." onClick={props.onDecimal} />
      <Key label="a/b" onClick={props.onFraction} className="btn-secondary text-xs" />
    </div>
  )
}
