import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "../../hooks/useTheme"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className="btn-secondary gap-2"
      title={`Current: ${theme}, Click for: ${nextTheme}`}
    >
      <Icon size={16} />
    </button>
  )
}
