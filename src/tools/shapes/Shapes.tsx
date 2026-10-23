import { useState } from "react"
import {
  rightTriangleSolve,
  triangleBySides,
  triangleByBaseHeight,
  circleSolve,
  rectangleSolve,
  squareSolve,
  trapezoidSolve,
  sphereSolve,
  cylinderSolve,
  coneSolve,
  boxSolve,
  type ShapeResult,
} from "./calc"

type ShapeKey =
  | "rightTriangle" | "triangleSides" | "triangleBaseHeight" | "circle" | "rectangle" | "square" | "trapezoid"
  | "sphere" | "cylinder" | "cone" | "box"

interface FieldDef {
  key: string
  label: string
  placeholder?: string
}

interface ShapeDef {
  label: string
  group: "Triangles" | "Circles & Quadrilaterals" | "3D Solids"
  fields: FieldDef[]
  hint?: string
  resultLabels: Record<string, string>
}

const SHAPES: Record<ShapeKey, ShapeDef> = {
  rightTriangle: {
    label: "Right Triangle (find a side)",
    group: "Triangles",
    hint: "Fill in any two of the three sides - the third (including the hypotenuse) is solved for",
    fields: [
      { key: "a", label: "Leg a" },
      { key: "b", label: "Leg b" },
      { key: "c", label: "Hypotenuse c" },
    ],
    resultLabels: { a: "Leg a", b: "Leg b", c: "Hypotenuse c", area: "Area", perimeter: "Perimeter" },
  },
  triangleSides: {
    label: "Triangle (by 3 sides)",
    group: "Triangles",
    fields: [
      { key: "a", label: "Side a" },
      { key: "b", label: "Side b" },
      { key: "c", label: "Side c" },
    ],
    resultLabels: { perimeter: "Perimeter", area: "Area" },
  },
  triangleBaseHeight: {
    label: "Triangle (by base & height)",
    group: "Triangles",
    fields: [
      { key: "base", label: "Base" },
      { key: "height", label: "Height" },
    ],
    resultLabels: { area: "Area" },
  },
  circle: {
    label: "Circle",
    group: "Circles & Quadrilaterals",
    hint: "Fill in exactly one - radius, diameter, circumference, or area - to get the rest",
    fields: [
      { key: "radius", label: "Radius" },
      { key: "diameter", label: "Diameter" },
      { key: "circumference", label: "Circumference" },
      { key: "area", label: "Area" },
    ],
    resultLabels: { radius: "Radius", diameter: "Diameter", circumference: "Circumference", area: "Area" },
  },
  rectangle: {
    label: "Rectangle",
    group: "Circles & Quadrilaterals",
    fields: [
      { key: "length", label: "Length" },
      { key: "width", label: "Width" },
    ],
    resultLabels: { area: "Area", perimeter: "Perimeter", diagonal: "Diagonal" },
  },
  square: {
    label: "Square",
    group: "Circles & Quadrilaterals",
    fields: [{ key: "side", label: "Side" }],
    resultLabels: { area: "Area", perimeter: "Perimeter", diagonal: "Diagonal" },
  },
  trapezoid: {
    label: "Trapezoid",
    group: "Circles & Quadrilaterals",
    fields: [
      { key: "a", label: "Parallel side a" },
      { key: "b", label: "Parallel side b" },
      { key: "height", label: "Height" },
    ],
    resultLabels: { area: "Area" },
  },
  sphere: {
    label: "Sphere",
    group: "3D Solids",
    fields: [{ key: "radius", label: "Radius" }],
    resultLabels: { volume: "Volume", surfaceArea: "Surface Area" },
  },
  cylinder: {
    label: "Cylinder",
    group: "3D Solids",
    fields: [
      { key: "radius", label: "Radius" },
      { key: "height", label: "Height" },
    ],
    resultLabels: { volume: "Volume", surfaceArea: "Surface Area" },
  },
  cone: {
    label: "Cone",
    group: "3D Solids",
    fields: [
      { key: "radius", label: "Radius" },
      { key: "height", label: "Height" },
    ],
    resultLabels: { slantHeight: "Slant Height", volume: "Volume", surfaceArea: "Surface Area" },
  },
  box: {
    label: "Rectangular Prism (Box)",
    group: "3D Solids",
    fields: [
      { key: "length", label: "Length" },
      { key: "width", label: "Width" },
      { key: "height", label: "Height" },
    ],
    resultLabels: { volume: "Volume", surfaceArea: "Surface Area", diagonal: "Diagonal" },
  },
}

const GROUPS: ShapeDef["group"][] = ["Triangles", "Circles & Quadrilaterals", "3D Solids"]

function compute(shape: ShapeKey, values: Record<string, string>): ShapeResult | { error: string } {
  const n = (key: string) => {
    const raw = values[key]
    if (raw === undefined || raw.trim() === "") return undefined
    const num = Number(raw)
    return isNaN(num) ? undefined : num
  }

  switch (shape) {
    case "rightTriangle": return rightTriangleSolve(n("a"), n("b"), n("c"))
    case "triangleSides": {
      const a = n("a"), b = n("b"), c = n("c")
      if (a === undefined || b === undefined || c === undefined) return { error: "Fill in all three sides" }
      return triangleBySides(a, b, c)
    }
    case "triangleBaseHeight": {
      const base = n("base"), height = n("height")
      if (base === undefined || height === undefined) return { error: "Fill in base and height" }
      return triangleByBaseHeight(base, height)
    }
    case "circle": return circleSolve({ radius: n("radius"), diameter: n("diameter"), circumference: n("circumference"), area: n("area") })
    case "rectangle": {
      const length = n("length"), width = n("width")
      if (length === undefined || width === undefined) return { error: "Fill in length and width" }
      return rectangleSolve(length, width)
    }
    case "square": {
      const side = n("side")
      if (side === undefined) return { error: "Fill in the side length" }
      return squareSolve(side)
    }
    case "trapezoid": {
      const a = n("a"), b = n("b"), height = n("height")
      if (a === undefined || b === undefined || height === undefined) return { error: "Fill in both parallel sides and the height" }
      return trapezoidSolve(a, b, height)
    }
    case "sphere": {
      const radius = n("radius")
      if (radius === undefined) return { error: "Fill in the radius" }
      return sphereSolve(radius)
    }
    case "cylinder": {
      const radius = n("radius"), height = n("height")
      if (radius === undefined || height === undefined) return { error: "Fill in radius and height" }
      return cylinderSolve(radius, height)
    }
    case "cone": {
      const radius = n("radius"), height = n("height")
      if (radius === undefined || height === undefined) return { error: "Fill in radius and height" }
      return coneSolve(radius, height)
    }
    case "box": {
      const length = n("length"), width = n("width"), height = n("height")
      if (length === undefined || width === undefined || height === undefined) return { error: "Fill in length, width, and height" }
      return boxSolve(length, width, height)
    }
  }
}

export default function Shapes() {
  const [shape, setShape] = useState<ShapeKey>("rightTriangle")
  const [values, setValues] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ShapeResult | null>(null)
  const [error, setError] = useState<string>("")

  const def = SHAPES[shape]

  function changeShape(next: ShapeKey) {
    setShape(next)
    setValues({})
    setResult(null)
    setError("")
  }

  function updateValue(key: string, value: string) {
    setValues({ ...values, [key]: value })
  }

  function calculate() {
    const outcome = compute(shape, values)
    if ("error" in outcome) {
      setError(outcome.error)
      setResult(null)
    } else {
      setError("")
      setResult(outcome)
    }
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Shapes Calculator</h2>
        <span className="badge-secondary ui-green">Triangles, Circles &amp; Solids</span>
      </div>

      <select className="form-input" value={shape} onChange={e => changeShape(e.target.value as ShapeKey)}>
        {GROUPS.map(group => (
          <optgroup key={group} label={group}>
            {(Object.entries(SHAPES) as [ShapeKey, ShapeDef][])
              .filter(([, d]) => d.group === group)
              .map(([key, d]) => <option key={key} value={key}>{d.label}</option>)}
          </optgroup>
        ))}
      </select>

      {def.hint && <p className="text-sm opacity-60">{def.hint}</p>}

      <div className="grid grid-cols-2 gap-4">
        {def.fields.map(f => (
          <input
            key={f.key}
            className="form-input"
            value={values[f.key] ?? ""}
            onChange={e => updateValue(f.key, e.target.value)}
            placeholder={f.label}
            type="number"
          />
        ))}
      </div>

      <button className="btn-accent w-full" onClick={calculate}>
        Calculate
      </button>

      {error && <div className="glass rounded-lg p-4 font-mono text-sm">{error}</div>}

      {result && (
        <div className="space-y-2">
          {Object.entries(result).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between glass rounded-lg p-3">
              <span className="font-medium">{def.resultLabels[key] ?? key}</span>
              <span className="font-mono">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
