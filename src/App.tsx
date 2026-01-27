import { useState } from "react"
import { Menu, X } from "lucide-react"

import Navbar from "./components/layout/Navbar"
import Sidebar from "./components/layout/Sidebar"

import Calculator from "./tools/calculator/Calculator"
import Rounding from "./tools/rounding/Rounding.tsx"
import UnitConverter from "./tools/unit-converter/UnitConverter.tsx"
import Fractions from "./tools/fractions/Fractions.tsx"
import LCM from "./tools/math/LCM.tsx"
import GCF from "./tools/math/GCF.tsx"
import PrimeFactorization from "./tools/math/PrimeFactorization.tsx"
import ListFactors from "./tools/math/ListFactors.tsx"
import PrimeFinder from "./tools/math/PrimeFinder.tsx"
import TimeCalculator from "./tools/time/TimeCalculator.tsx"

import type { ToolId } from "./tools/types"

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolId>("calculator")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="page-frame">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="pt-16 px-4 md:px-6">
        <div className="container md:grid md:grid-cols-[260px_1fr] md:gap-6">
          {/* Sidebar */}
          <div className={`${
            sidebarOpen ? "fixed left-0 top-16 bottom-0 w-64 z-50 p-4" : "hidden"
          } md:block md:static md:p-0`}>
            <Sidebar active={activeTool} onSelect={(id) => {
              setActiveTool(id)
              setSidebarOpen(false)
            }} />
          </div>

          {/* Main Content */}
          <div className="md:ml-0">
            {activeTool === "calculator" && <Calculator />}
            {activeTool === "rounding" && <Rounding />}
            {activeTool === "unit-converter" && <UnitConverter />}
            {activeTool === "fractions" && <Fractions />}
            {activeTool === "lcm" && <LCM />}
            {activeTool === "gcf" && <GCF />}
            {activeTool === "prime-factorization" && <PrimeFactorization />}
            {activeTool === "list-factors" && <ListFactors />}
            {activeTool === "prime-finder" && <PrimeFinder />}
            {activeTool === "time-calculator" && <TimeCalculator />}
          </div>
        </div>
      </div>
    </div>
  )
}
