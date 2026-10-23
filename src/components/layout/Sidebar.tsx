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
  RedoDot,
  Variable,
  Square,
  Percent,
  Gauge,
  Minimize2,
  Percent as PercentIcon,
  Sigma,
  LineChart,
  Maximize2,
  Grid3x3,
  Puzzle,
  FunctionSquare,
  Triangle,
  Superscript
} from "lucide-react"

import type { ToolId } from "../../tools/types"

const items: { id: ToolId; label: string; icon: any }[] = [
  { id: "calculator", label: "Calculator", icon: Calculator },
  { id: "rounding", label: "Number Rounding", icon: ArrowLeftRight },
  { id: "unit-converter", label: "Unit Converter", icon: Ruler },
  { id: "fractions", label: "Fractions", icon: CircleDivide },
  { id: "lcm-gcf", label: "LCM / GCF Calculator", icon: Hash },
  { id: "prime-factorization", label: "Prime Factorization", icon: GitBranch },
  { id: "list-factors", label: "List Factors", icon: List },
  { id: "prime-finder", label: "Prime Finder", icon: Search },
  { id: "time-calculator", label: "Time Calculator", icon: Clock },
  { id: "one-step-equation", label: "One Step Equation", icon: RedoDot },
  { id: "solve-for", label: "Solve For Variable", icon: Variable },
  { id: "perfect-square", label: "Perfect Square Finder", icon: Square },
  { id: "ratio", label: "Ratio Calculator", icon: Divide },
  { id: "interest", label: "Interest Calculator", icon: Percent },
  { id: "unit-rate", label: "Unit Rate", icon: Gauge },
  { id: "simplify", label: "Simplify Expression", icon: Minimize2 },
  { id: "percent", label: "Percent Calculator", icon: PercentIcon },
  { id: "unit-calculator", label: "Unit Calculator", icon: Sigma },
  { id: "inequality-graph", label: "Inequality Graph", icon: LineChart },
  { id: "scale", label: "Scale Calculator", icon: Maximize2 },
  { id: "line-grapher", label: "Line & Slope Tool", icon: Grid3x3 },
  { id: "number-finder", label: "Number Finder", icon: Puzzle },
  { id: "function-calc", label: "Function Calculator", icon: FunctionSquare },
  { id: "shapes", label: "Shapes Calculator", icon: Triangle },
  { id: "polynomials", label: "Polynomials", icon: Superscript }
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
