import { useState } from "react"
import { Plus, X } from "lucide-react"
import ResultDisplay from "../../components/ResultDisplay"
import {
  parsePolynomial,
  degreeOf,
  termCountName,
  degreeName,
  formatPolynomial,
  variablesOf,
  addPoly,
  mulPoly,
  compareLikeTerms,
  simplifyRational,
  findGCF,
  factorPolynomial,
  expandToFactors,
  type LikeTermsResult,
  type GCFResult,
  type FactorResult,
} from "./calc"
import { evaluateExpression, extractFunctionVariables } from "../functionCalc/calc"

type Mode = "classify" | "simplify" | "rational" | "gcf" | "factor" | "expand" | "addSub" | "multiply" | "evaluate" | "likeTerms"

export default function Polynomials() {
  const [mode, setMode] = useState<Mode>("classify")
  const [result, setResult] = useState<string>("—")

  // Classify mode
  const [expr, setExpr] = useState("3x^2/3")
  const [classifyRows, setClassifyRows] = useState<{ label: string; value: string }[] | null>(null)

  // Simplify mode
  const [simplifyExpr, setSimplifyExpr] = useState("")

  // Simplify Rational Expression mode
  const [ratNum, setRatNum] = useState("18m^2n")
  const [ratDen, setRatDen] = useState("6mn")

  // GCF mode
  const [gcfTerms, setGcfTerms] = useState<string[]>(["2xy^2", "x^2y"])
  const [gcfResult, setGcfResult] = useState<GCFResult | null>(null)

  // Factor mode
  const [factorExpr, setFactorExpr] = useState("x^2 - 9")
  const [factorResult, setFactorResult] = useState<FactorResult | null>(null)

  // Expand as Repeated Multiplication mode
  const [expandExpr, setExpandExpr] = useState("8x^2")

  // Add/Subtract & Multiply modes
  const [exprA, setExprA] = useState("")
  const [exprB, setExprB] = useState("")
  const [op, setOp] = useState<"+" | "-">("+")

  // Evaluate mode
  const [evalExpr, setEvalExpr] = useState("")
  const [evalValues, setEvalValues] = useState<Record<string, string>>({})

  // Like Terms mode
  const [termA, setTermA] = useState("-x^3")
  const [termB, setTermB] = useState("x^3")
  const [likeTermsResult, setLikeTermsResult] = useState<LikeTermsResult | null>(null)

  const evalVariables = (() => {
    try {
      return extractFunctionVariables(evalExpr)
    } catch {
      return []
    }
  })()

  function handleClassify() {
    try {
      const p = parsePolynomial(expr)
      const deg = degreeOf(p)
      const isZero = p.length === 0
      setClassifyRows([
        { label: "Is it a polynomial?", value: "Yes" },
        { label: "Simplified form", value: formatPolynomial(p) },
        { label: "Term type", value: termCountName(p.length) },
        { label: "Degree", value: isZero ? "—" : String(deg) },
        { label: "Classification", value: degreeName(deg, isZero) },
        { label: "Variables", value: variablesOf(p).join(", ") || "none" },
      ])
      setResult("")
    } catch (e) {
      setClassifyRows(null)
      setResult(e instanceof Error ? `Not a polynomial: ${e.message}` : "Could not parse the expression")
    }
  }

  function handleSimplify() {
    try {
      const p = parsePolynomial(simplifyExpr)
      setResult(formatPolynomial(p))
    } catch (e) {
      setResult(e instanceof Error ? `Not a polynomial: ${e.message}` : "Could not parse the expression")
    }
  }

  function handleRational() {
    const outcome = simplifyRational(ratNum, ratDen)
    setResult("error" in outcome ? outcome.error : outcome.simplified)
  }

  function handleExpand() {
    const outcome = expandToFactors(expandExpr)
    setResult("error" in outcome ? outcome.error : outcome.expanded)
  }

  function addGcfTerm() {
    setGcfTerms([...gcfTerms, ""])
  }

  function removeGcfTerm(index: number) {
    if (gcfTerms.length > 2) {
      setGcfTerms(gcfTerms.filter((_, i) => i !== index))
    }
  }

  function updateGcfTerm(index: number, value: string) {
    setGcfTerms(gcfTerms.map((t, i) => (i === index ? value : t)))
  }

  function handleGCF() {
    const outcome = findGCF(gcfTerms)
    if ("error" in outcome) {
      setGcfResult(null)
      setResult(outcome.error)
      return
    }
    setGcfResult(outcome)
    setResult("")
  }

  function handleFactor() {
    const outcome = factorPolynomial(factorExpr)
    if ("error" in outcome) {
      setFactorResult(null)
      setResult(outcome.error)
      return
    }
    setFactorResult(outcome)
    setResult("")
  }

  function handleAddSub() {
    try {
      const a = parsePolynomial(exprA)
      const b = parsePolynomial(exprB)
      const combined = addPoly(a, b, op === "+" ? 1 : -1)
      setResult(formatPolynomial(combined))
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Could not parse one of the expressions")
    }
  }

  function handleMultiply() {
    try {
      const a = parsePolynomial(exprA)
      const b = parsePolynomial(exprB)
      setResult(formatPolynomial(mulPoly(a, b)))
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Could not parse one of the expressions")
    }
  }

  function handleEvaluate() {
    try {
      const values: Record<string, number> = {}
      for (const v of evalVariables) {
        const num = Number(evalValues[v])
        if (isNaN(num)) {
          setResult(`Enter a valid number for "${v}"`)
          return
        }
        values[v] = num
      }
      setResult(String(evaluateExpression(evalExpr, values)))
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Could not parse the expression")
    }
  }

  function handleLikeTerms() {
    const outcome = compareLikeTerms(termA, termB)
    if ("error" in outcome) {
      setLikeTermsResult(null)
      setResult(outcome.error)
      return
    }
    setLikeTermsResult(outcome)
    setResult("")
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Polynomials</h2>
        <span className="badge-secondary ui-teal">Classify, Combine &amp; Evaluate</span>
      </div>

      <select className="form-input" value={mode} onChange={e => { setMode(e.target.value as Mode); setResult("—"); setClassifyRows(null); setLikeTermsResult(null); setGcfResult(null); setFactorResult(null) }}>
        <option value="classify">Classify a Polynomial</option>
        <option value="simplify">Simplify a Polynomial Expression</option>
        <option value="rational">Simplify a Rational Expression</option>
        <option value="gcf">Find the GCF</option>
        <option value="factor">Factor a Polynomial</option>
        <option value="expand">Expand as Repeated Multiplication</option>
        <option value="likeTerms">Are These Like Terms?</option>
        <option value="addSub">Add / Subtract Two Polynomials</option>
        <option value="multiply">Multiply Two Polynomials</option>
        <option value="evaluate">Evaluate at a Value</option>
      </select>

      {mode === "classify" && (
        <>
          <input
            className="form-input"
            value={expr}
            onChange={e => setExpr(e.target.value)}
            placeholder="e.g. 3x^2/3, x^3 - 2x^2 + x - 5, 1/x"
          />
          <button className="btn-accent w-full" onClick={handleClassify}>
            Classify
          </button>
          {classifyRows && (
            <div className="space-y-2">
              {classifyRows.map((r, i) => (
                <div key={i} className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="font-medium">{r.label}</span>
                  <span className="font-mono">{r.value}</span>
                </div>
              ))}
            </div>
          )}
          {!classifyRows && result && result !== "—" && <ResultDisplay value={result} />}
        </>
      )}

      {mode === "simplify" && (
        <>
          <input
            className="form-input"
            value={simplifyExpr}
            onChange={e => setSimplifyExpr(e.target.value)}
            placeholder="e.g. (x+2)(x-3), 3x^2 + 2x - 5x^2 + 4"
          />
          <button className="btn-accent w-full" onClick={handleSimplify}>
            Simplify
          </button>
          <ResultDisplay value={result} />
        </>
      )}

      {mode === "rational" && (
        <>
          <p className="text-sm opacity-60">e.g. 18m^2n / 6mn simplifies to 3m</p>
          <div className="flex items-center gap-2">
            <input className="form-input" value={ratNum} onChange={e => setRatNum(e.target.value)} placeholder="Numerator, e.g. 18m^2n" />
            <span className="opacity-60">/</span>
            <input className="form-input" value={ratDen} onChange={e => setRatDen(e.target.value)} placeholder="Denominator, e.g. 6mn" />
          </div>
          <button className="btn-accent w-full" onClick={handleRational}>
            Simplify
          </button>
          <ResultDisplay value={result} />
        </>
      )}

      {mode === "gcf" && (
        <>
          <p className="text-sm opacity-60">
            Enter each term separately - e.g. "2xy^2" and "x^2y" -&gt; GCF "xy". You can also put
            a whole polynomial in one box, e.g. "12x^3 + 18x^2 - 6x" -&gt; GCF "6x".
          </p>
          <div className="space-y-3">
            {gcfTerms.map((t, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className="form-input flex-1"
                  value={t}
                  onChange={e => updateGcfTerm(index, e.target.value)}
                  placeholder={`Term ${index + 1}`}
                />
                {gcfTerms.length > 2 && (
                  <button className="btn-danger px-3" onClick={() => removeGcfTerm(index)}>
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary" onClick={addGcfTerm}>
              <Plus size={16} className="mr-2" />
              Add Term
            </button>
            <button className="btn-accent" onClick={handleGCF}>
              Find GCF
            </button>
          </div>
          {gcfResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between glass rounded-lg p-3">
                <span className="font-medium">GCF</span>
                <span className="font-mono">{gcfResult.gcf}</span>
              </div>
              <div className="flex items-center justify-between glass rounded-lg p-3">
                <span className="font-medium">Factored form</span>
                <span className="font-mono">{gcfResult.factoredForm}</span>
              </div>
            </div>
          )}
          {!gcfResult && result && result !== "—" && <ResultDisplay value={result} />}
        </>
      )}

      {mode === "factor" && (
        <>
          <p className="text-sm opacity-60">Pulls out the GCF, then tries difference of squares, perfect square trinomials, and quadratic factoring</p>
          <input
            className="form-input"
            value={factorExpr}
            onChange={e => setFactorExpr(e.target.value)}
            placeholder="e.g. x^2 - 9, x^2 + 5x + 6, 2x^2 + 7x + 3"
          />
          <button className="btn-accent w-full" onClick={handleFactor}>
            Factor
          </button>
          {factorResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between glass rounded-lg p-3">
                <span className="font-medium">Factored form</span>
                <span className="font-mono">{factorResult.factoredForm}</span>
              </div>
              {!factorResult.fullyFactored && (
                <p className="text-sm opacity-60">No further factoring found - this may already be irreducible over the integers</p>
              )}
            </div>
          )}
          {!factorResult && result && result !== "—" && <ResultDisplay value={result} />}
        </>
      )}

      {mode === "expand" && (
        <>
          <p className="text-sm opacity-60">e.g. 8x^2 -&gt; 2*2*2*x*x - breaks the coefficient into prime factors and repeats each variable</p>
          <input
            className="form-input"
            value={expandExpr}
            onChange={e => setExpandExpr(e.target.value)}
            placeholder="e.g. 8x^2, 12x^2y^3"
          />
          <button className="btn-accent w-full" onClick={handleExpand}>
            Expand
          </button>
          <ResultDisplay value={result} />
        </>
      )}

      {mode === "likeTerms" && (
        <>
          <p className="text-sm opacity-60">e.g. -x^3 and x^3 are like terms - only the coefficient differs</p>
          <div className="grid grid-cols-2 gap-4">
            <input className="form-input" value={termA} onChange={e => setTermA(e.target.value)} placeholder="First term, e.g. -x^3" />
            <input className="form-input" value={termB} onChange={e => setTermB(e.target.value)} placeholder="Second term, e.g. x^3" />
          </div>
          <button className="btn-accent w-full" onClick={handleLikeTerms}>
            Compare
          </button>
          {likeTermsResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between glass rounded-lg p-3">
                <span className="font-medium">Like terms?</span>
                <span className="font-mono">{likeTermsResult.isLike ? "Yes" : "No"}</span>
              </div>
              <div className="glass rounded-lg p-3 text-sm">{likeTermsResult.reason}</div>
            </div>
          )}
          {!likeTermsResult && result && result !== "—" && <ResultDisplay value={result} />}
        </>
      )}

      {mode === "addSub" && (
        <>
          <input className="form-input" value={exprA} onChange={e => setExprA(e.target.value)} placeholder="First polynomial, e.g. x^2 + 3x" />
          <select className="form-input" value={op} onChange={e => setOp(e.target.value as "+" | "-")}>
            <option value="+">+ Add</option>
            <option value="-">− Subtract</option>
          </select>
          <input className="form-input" value={exprB} onChange={e => setExprB(e.target.value)} placeholder="Second polynomial, e.g. 2x^2 - x + 5" />
          <button className="btn-accent w-full" onClick={handleAddSub}>Calculate</button>
          <ResultDisplay value={result} />
        </>
      )}

      {mode === "multiply" && (
        <>
          <input className="form-input" value={exprA} onChange={e => setExprA(e.target.value)} placeholder="First polynomial, e.g. x + 1" />
          <input className="form-input" value={exprB} onChange={e => setExprB(e.target.value)} placeholder="Second polynomial, e.g. x - 1" />
          <button className="btn-accent w-full" onClick={handleMultiply}>Multiply</button>
          <ResultDisplay value={result} />
        </>
      )}

      {mode === "evaluate" && (
        <>
          <input className="form-input" value={evalExpr} onChange={e => setEvalExpr(e.target.value)} placeholder="e.g. x^2 - 2x + 1" />
          {evalVariables.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {evalVariables.map(v => (
                <div key={v} className="flex items-center gap-2">
                  <span className="opacity-60 whitespace-nowrap">{v} =</span>
                  <input
                    className="form-input"
                    value={evalValues[v] ?? ""}
                    onChange={e => setEvalValues({ ...evalValues, [v]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          )}
          <button className="btn-accent w-full" onClick={handleEvaluate}>Evaluate</button>
          <ResultDisplay value={result} />
        </>
      )}
    </div>
  )
}
