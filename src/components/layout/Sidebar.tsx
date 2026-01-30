import {
  Calculator,
  ArrowLeftRight,
  Ruler,
  Hash,
  Divide,
  GitBranch,
  List,
  Search,
  Clock,
  CircleDivide,
  RedoDot
} from "lucide-react"

import type { ToolId } from "../../tools/types"

const items: { id: ToolId; label: string; icon: any }[] = [
  { id: "calculator", label: "Calculator", icon: Calculator },
  { id: "rounding", label: "Number Rounding", icon: ArrowLeftRight },
  { id: "unit-converter", label: "Unit Converter", icon: Ruler },
  { id: "fractions", label: "Fractions", icon: CircleDivide },
  { id: "lcm", label: "LCM Calculator", icon: Hash },
  { id: "gcf", label: "GCF Calculator", icon: Divide },
  { id: "prime-factorization", label: "Prime Factorization", icon: GitBranch },
  { id: "list-factors", label: "List Factors", icon: List },
  { id: "prime-finder", label: "Prime Finder", icon: Search },
  { id: "time-calculator", label: "Time Calculator", icon: Clock },
  { id: "one-step-equation", label: "One Step Equation", icon: RedoDot }
]

interface Props {
  active: ToolId
  onSelect: (id: ToolId) => void
}

export default function Sidebar({ active, onSelect }: Props) {
  return (
    <aside className="sidebar-gradient rounded-xl p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-2rem)]">
      {items.map(({ id, label, icon: Icon }) => {
        const isActive = active === id

        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition
              ${
                isActive
                  ? "bg-black/10 dark:bg-white/10"
                  : "hover:bg-black/5 dark:hover:bg-white/10"
              }`}
          >
            <Icon size={18} strokeWidth={1.5} />
            <span className="text-sm font-medium">{label}</span>
          </button>
        )
      })}
    </aside>
  )
}
