import { Moon, Sun } from "lucide-react"
import { useTheme } from "../../hooks/useTheme"

export default function ThemeToggle() {
  const { dark, setDark } = useTheme()

  return (
    <button
      onClick={() => setDark(!dark)}
      className="btn-secondary gap-2"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
