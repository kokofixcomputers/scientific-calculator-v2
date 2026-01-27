import { useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("system")
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("theme", theme)
    
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      setDark(mediaQuery.matches)
      
      const handleChange = (e: MediaQueryListEvent) => setDark(e.matches)
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    } else {
      setDark(theme === "dark")
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return { theme, setTheme, dark }
}
