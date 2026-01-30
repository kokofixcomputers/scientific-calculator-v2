import type { Operator } from "./calc"
import Key from "./Key"

interface Props {
  scientific: boolean
  fractionInputMode: boolean
  onDigit: (d: string) => void
  onDecimal: () => void
  onFraction: () => void
  onMixedNumber: () => void
  onParenthesis: (p: string) => void
  onCustomRoot: () => void
  onPi: () => void
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
    <div className="grid grid-cols-4 gap-3 select-none w-full md:w-auto">
      {/* Scientific row */}
      {props.scientific && (
        <>
          <Key label="(" onClick={() => props.onParenthesis("(")} className="btn-yellow rounded-full px-4 py-3"/>
          <Key label=")" onClick={() => props.onParenthesis(")")} className="btn-yellow rounded-full px-4 py-3" />
          <Key label="√" onClick={props.onSqrt} className="btn-yellow rounded-full px-4 py-3" />
          <Key label="^" onClick={props.onPower} className="btn-yellow rounded-full px-4 py-3" />
          
          <Key label="x²" onClick={props.onSquare} className="btn-yellow rounded-full px-4 py-3" />
          <Key label="∛" onClick={props.onCbrt} className="btn-yellow rounded-full px-4 py-3" />
          <Key label="n√" onClick={props.onCustomRoot} className="btn-yellow rounded-full px-4 py-3" />
          <Key label="π" onClick={props.onPi} className="btn-yellow rounded-full px-4 py-3" />
        </>
      )}

      {/* Row 1 */}
      <Key label="C" onClick={props.onClear} className="btn-danger rounded-full px-4 py-3" />
      <Key label="⌫" onClick={props.onBackspace} />
      <Key label="÷" onClick={() => props.onOperator("/")} className="btn-orange rounded-full px-4 py-3" />
      <Key label="×" onClick={() => props.onOperator("*")} className="btn-orange rounded-full px-4 py-3" />

      {/* Row 2 */}
      <Key label="7" onClick={() => props.onDigit("7")} />
      <Key label="8" onClick={() => props.onDigit("8")} />
      <Key label="9" onClick={() => props.onDigit("9")} />
      <Key label="−" onClick={() => props.onOperator("-")} className="btn-orange rounded-full px-4 py-3" />

      {/* Row 3 */}
      <Key label="4" onClick={() => props.onDigit("4")} />
      <Key label="5" onClick={() => props.onDigit("5")} />
      <Key label="6" onClick={() => props.onDigit("6")} />
      <Key label="+" onClick={() => props.onOperator("+")} className="btn-orange rounded-full px-4 py-3" />

      {/* Row 4 */}
      <Key label="1" onClick={() => props.onDigit("1")} />
      <Key label="2" onClick={() => props.onDigit("2")} />
      <Key label="3" onClick={() => props.onDigit("3")} />
      <Key label="=" onClick={props.onEquals} className="btn-equals rounded-full px-4 py-3" />

      {/* Row 5 */}
      <Key label="0" onClick={() => props.onDigit("0")} />
      <Key label="." onClick={props.onDecimal} />
      <Key 
        label="a b/c" 
        onClick={props.onMixedNumber} 
        className={`btn-secondary text-xs rounded-full px-4 py-3 ${props.fractionInputMode ? "bg-black/5 dark:bg-white/10" : ""}`} 
      />
      <Key 
        label="a/b" 
        onClick={props.onFraction} 
        className={`btn-secondary text-xs rounded-full px-4 py-3 ${props.fractionInputMode ? "bg-black/5 dark:bg-white/10" : ""}`} 
      />
    </div>
  )
}
