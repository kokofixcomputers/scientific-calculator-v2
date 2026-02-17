import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import type { ToolId } from "../tools/types"

interface ToolContextType {
  navigateToTool: (toolId: ToolId, value: string) => void
  pendingValue: string | null
  consumePendingValue: () => string | null
}

const ToolContext = createContext<ToolContextType | undefined>(undefined)

export function ToolProvider({ children, onNavigate }: { children: ReactNode; onNavigate: (toolId: ToolId) => void }) {
  const [pendingValue, setPendingValue] = useState<string | null>(null)

  const navigateToTool = (toolId: ToolId, value: string) => {
    setPendingValue(value)
    onNavigate(toolId)
  }

  const consumePendingValue = () => {
    const value = pendingValue
    setPendingValue(null)
    return value
  }

  return (
    <ToolContext.Provider value={{ navigateToTool, pendingValue, consumePendingValue }}>
      {children}
    </ToolContext.Provider>
  )
}

export function useToolContext() {
  const context = useContext(ToolContext)
  if (!context) throw new Error("useToolContext must be used within ToolProvider")
  return context
}
