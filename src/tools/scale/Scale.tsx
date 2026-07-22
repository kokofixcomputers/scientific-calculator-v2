import { useState } from "react"
import ResultDisplay from "../../components/ResultDisplay"
import { Plus, X } from "lucide-react"
import { calculateScaleModel, mapToActual, actualToMap, type ScaleModelResult } from "./calc"

interface DimensionRow {
  label: string
  real: string
  model: string
}

export default function Scale() {
  const [mode, setMode] = useState<"model" | "map">("model")

  // Scale Model mode
  const [rows, setRows] = useState<DimensionRow[]>([
    { label: "Height", real: "", model: "" },
    { label: "Width", real: "", model: "" },
  ])
  const [modelResult, setModelResult] = useState<ScaleModelResult | null>(null)

  function addRow() {
    setRows([...rows, { label: "", real: "", model: "" }])
  }

  function removeRow(index: number) {
    if (rows.length > 2) {
      setRows(rows.filter((_, i) => i !== index))
    }
  }

  function updateRow(index: number, field: keyof DimensionRow, value: string) {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], [field]: value }
    setRows(newRows)
  }

  function calculateModel() {
    const dims = rows
      .map((row, i) => ({
        label: row.label.trim() || `Dimension ${i + 1}`,
        real: Number(row.real),
        model: row.model.trim() === "" ? undefined : Number(row.model),
      }))
      .filter(d => !isNaN(d.real))

    if (dims.length < 2) {
      setModelResult(null)
      return
    }

    setModelResult(calculateScaleModel(dims))
  }

  // Map / Drawing Scale mode
  const [mapValue, setMapValue] = useState("")
  const [mapUnit, setMapUnit] = useState("in")
  const [actualValue, setActualValue] = useState("")
  const [actualUnit, setActualUnit] = useState("yd")
  const [direction, setDirection] = useState<"mapToActual" | "actualToMap">("mapToActual")
  const [distance, setDistance] = useState("")
  const [mapResult, setMapResult] = useState<string>("—")

  function calculateMap() {
    const scaleMap = Number(mapValue)
    const scaleActual = Number(actualValue)
    const dist = Number(distance)
    if (isNaN(scaleMap) || isNaN(scaleActual) || isNaN(dist)) return

    if (direction === "mapToActual") {
      const r = mapToActual(scaleMap, scaleActual, dist)
      setMapResult(isNaN(r) ? "Invalid scale" : `${r} ${actualUnit}`)
    } else {
      const r = actualToMap(scaleMap, scaleActual, dist)
      setMapResult(isNaN(r) ? "Invalid scale" : `${r} ${mapUnit}`)
    }
  }

  return (
    <div className="card space-y-8 max-w-xl mx-auto">
      <div>
        <h2>Scale Calculator</h2>
        <span className="badge-secondary ui-orange">Models &amp; Maps</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          className={mode === "model" ? "btn-accent" : "btn-secondary"}
          onClick={() => setMode("model")}
        >
          Scale Model
        </button>
        <button
          className={mode === "map" ? "btn-accent" : "btn-secondary"}
          onClick={() => setMode("map")}
        >
          Map / Drawing Scale
        </button>
      </div>

      {mode === "model" && (
        <>
          <p className="text-sm opacity-60">
            Enter each real-world dimension. Fill in the model value for the one you already know
            (e.g. Height) - the scale factor is derived from it and applied to the rest.
          </p>

          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className="form-input flex-1"
                  value={row.label}
                  onChange={e => updateRow(index, "label", e.target.value)}
                  placeholder={`Dimension ${index + 1} (e.g., Height)`}
                />
                <input
                  className="form-input w-24"
                  value={row.real}
                  onChange={e => updateRow(index, "real", e.target.value)}
                  placeholder="Real"
                  type="number"
                />
                <input
                  className="form-input w-24"
                  value={row.model}
                  onChange={e => updateRow(index, "model", e.target.value)}
                  placeholder="Model"
                  type="number"
                />
                {rows.length > 2 && (
                  <button className="btn-danger px-3" onClick={() => removeRow(index)}>
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button className="btn-secondary" onClick={addRow}>
              <Plus size={16} className="mr-2" />
              Add Dimension
            </button>
            <button className="btn-accent" onClick={calculateModel}>
              Calculate
            </button>
          </div>

          {modelResult && (
            <div className="space-y-2">
              <div className="glass rounded-lg p-3 font-mono text-sm">
                Scale factor: {modelResult.scaleFactor}
              </div>
              {modelResult.dimensions.map((d, i) => (
                <div key={i} className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="font-medium">{d.label}</span>
                  <span className="font-mono">{d.real} → {d.model}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {mode === "map" && (
        <>
          <p className="text-sm opacity-60">e.g. a map scale of 1 in : 500 yd</p>

          <div className="flex items-center gap-2">
            <input className="form-input w-20" value={mapValue} onChange={e => setMapValue(e.target.value)} placeholder="1" type="number" />
            <input className="form-input w-20" value={mapUnit} onChange={e => setMapUnit(e.target.value)} placeholder="in" />
            <span className="opacity-60">:</span>
            <input className="form-input w-20" value={actualValue} onChange={e => setActualValue(e.target.value)} placeholder="500" type="number" />
            <input className="form-input w-20" value={actualUnit} onChange={e => setActualUnit(e.target.value)} placeholder="yd" />
          </div>

          <select className="form-input" value={direction} onChange={e => setDirection(e.target.value as "mapToActual" | "actualToMap")}>
            <option value="mapToActual">Map distance → Actual distance</option>
            <option value="actualToMap">Actual distance → Map distance</option>
          </select>

          <input
            className="form-input"
            value={distance}
            onChange={e => setDistance(e.target.value)}
            placeholder={direction === "mapToActual" ? `Distance on map (${mapUnit})` : `Actual distance (${actualUnit})`}
            type="number"
          />

          <button className="btn-accent w-full" onClick={calculateMap}>
            Calculate
          </button>

          <ResultDisplay value={mapResult} />
        </>
      )}
    </div>
  )
}
