import { useState } from "react"

import Navbar from "./components/layout/Navbar"
import Sidebar from "./components/layout/Sidebar"
import { ToolProvider } from "./contexts/ToolContext"

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
import OneStepEquation from "./tools/oneStepEquation/OneStepEquation.tsx"
import SolveFor from "./tools/solveFor/SolveFor.tsx"
import PerfectSquare from "./tools/perfectSquare/PerfectSquare.tsx"

import type { ToolId } from "./tools/types"

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolId>("calculator")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ToolProvider onNavigate={setActiveTool}>
      <div className="page-frame">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="pt-24 pb-16 px-4 md:px-6">
          <div className="max-w-4xl mx-auto md:grid md:grid-cols-[220px_1fr]">
            {/* Sidebar */}
            <div className={`${
              sidebarOpen ? "fixed inset-0 z-50 p-4 bg-[rgb(var(--bg))]" : "hidden"
            } md:block md:static md:p-0 md:bg-transparent`}>
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
              {activeTool === "one-step-equation" && <OneStepEquation />}
              {activeTool === "solve-for" && <SolveFor />}
              {activeTool === "perfect-square" && <PerfectSquare />}
            </div>
          </div>
        </div>
      </div>
    </ToolProvider>
  )
}
