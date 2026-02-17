import CopyButton from "./CopyButton"
import { ArrowRight, X } from "lucide-react"
import { useState } from "react"
import { useToolContext } from "../contexts/ToolContext"
import type { ToolId } from "../tools/types"
import { createPortal } from "react-dom"

interface Props {
  value: string
}

const tools: { id: ToolId; label: string }[] = [
  { id: "calculator", label: "Calculator" },
  { id: "rounding", label: "Number Rounding" },
  { id: "unit-converter", label: "Unit Converter" },
  { id: "fractions", label: "Fractions" },
  { id: "lcm", label: "LCM Calculator" },
  { id: "gcf", label: "GCF Calculator" },
  { id: "prime-factorization", label: "Prime Factorization" },
  { id: "list-factors", label: "List Factors" },
  { id: "prime-finder", label: "Prime Finder" },
  { id: "time-calculator", label: "Time Calculator" },
  { id: "one-step-equation", label: "One Step Equation" },
  { id: "solve-for", label: "Solve For Variable" },
  { id: "perfect-square", label: "Perfect Square Finder" }
]

export default function ResultDisplay({ value }: Props) {
  const [showModal, setShowModal] = useState(false)
  const { navigateToTool } = useToolContext()

  const handleSendTo = (toolId: ToolId) => {
    navigateToTool(toolId, value)
    setShowModal(false)
  }

  const modal = showModal ? createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setShowModal(false)}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Send to Tool</h3>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleSendTo(tool.id)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
              >
                {tool.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  ) : null

  return (
    <>
      <div className="glass rounded-lg p-4 font-mono text-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">{value}</div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
              title="Send to tool"
            >
              <ArrowRight size={18} />
            </button>
            <CopyButton value={value} />
          </div>
        </div>
      </div>
      {modal}
    </>
  )
}
